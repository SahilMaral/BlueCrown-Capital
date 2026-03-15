const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const Passbook = require('../models/Passbook');
const Bank = require('../models/Bank');
const Company = require('../models/Company');
const Loan = require('../models/Loan');
const Investment = require('../models/Investment');
const ApiError = require('../utils/ApiError');

class ReportService {
  /**
   * Day Report Logic
   */
  async getDayReport(companyId, reportDate) {
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Fetch Passbook entries for the company on that day
    // This includes entries for the company's Cash account AND its Banks
    const bankIds = await Bank.find({ companyId }).select('_id');
    const accountIds = [companyId, ...bankIds.map(b => b._id)];

    const transactions = await Passbook.find({
      account: { $in: accountIds },
      dateTime: { $gte: startOfDay, $lte: endOfDay }
    }).populate('receipt payment account').sort('dateTime');

    // 2. Separate into Receipts and Payments
    const receipts = transactions.filter(t => t.amount > 0);
    const payments = transactions.filter(t => t.amount < 0);

    // 3. Calculate Totals
    let totalCashReceipts = 0;
    let totalOnlineReceipts = 0;
    let totalCashPayments = 0;
    let totalOnlinePayments = 0;

    receipts.forEach(r => {
      if (r.isCash) totalCashReceipts += r.amount;
      else totalOnlineReceipts += r.amount;
    });

    payments.forEach(p => {
      if (p.isCash) totalCashPayments += Math.abs(p.amount);
      else totalOnlinePayments += Math.abs(p.amount);
    });

    // 4. Calculate Opening/Closing Balances for each source (Cash/Banks)
    const sourceBalances = [];
    let cashOpeningSum = 0;
    let cashClosingSum = 0;
    let onlineOpeningSum = 0;
    let onlineClosingSum = 0;

    for (const accId of accountIds) {
      const isCompanyCash = accId.toString() === companyId.toString();
      
      const lastKnownEntry = await Passbook.findOne({
        account: accId,
        dateTime: { $lt: startOfDay }
      }).sort('-dateTime');
      
      let openingBalance = 0;
      if (lastKnownEntry) {
        openingBalance = lastKnownEntry.closingBalance;
      } else {
        const accDoc = isCompanyCash ? 
          await Company.findById(accId) : await Bank.findById(accId);
        openingBalance = isCompanyCash ? 
          accDoc.cashOpeningBalance : accDoc.openingBalance;
      }

      const dayTransactions = transactions.filter(t => t.account.toString() === accId.toString());
      const dayNet = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const closingBalance = openingBalance + dayNet;

      const accDoc = isCompanyCash ? 
        await Company.findById(accId) : await Bank.findById(accId);
      const sourceName = isCompanyCash ? 'Cash' : accDoc.bankName;

      sourceBalances.push({
        source: sourceName,
        openingBalance,
        closingBalance,
        isCash: isCompanyCash
      });

      if (isCompanyCash) {
        cashOpeningSum += openingBalance;
        cashClosingSum += closingBalance;
      } else {
        onlineOpeningSum += openingBalance;
        onlineClosingSum += closingBalance;
      }
    }

    // 5. Merge for side-by-side view (Max length of receipts/payments)
    const maxLength = Math.max(receipts.length, payments.length);
    const reportData = [];
    for (let i = 0; i < maxLength; i++) {
      reportData.push({
        receipt: receipts[i] || {},
        payment: payments[i] || {}
      });
    }

    // 6. Calculate Differences (as per kasture-capital logic)
    const cashDifference = Math.abs(cashOpeningSum + totalCashReceipts - totalCashPayments);
    const onlineDifference = Math.abs(onlineOpeningSum + totalOnlineReceipts - totalOnlinePayments);

    return {
      reportData,
      receipts,
      payments,
      totalCashReceipts,
      totalOnlineReceipts,
      totalCashPayments,
      totalOnlinePayments,
      sourceBalances,
      cashOpeningSum,
      cashClosingSum,
      onlineOpeningSum,
      onlineClosingSum,
      cashDifference,
      onlineDifference
    };
  }

  /**
   * Ledger Report Logic
   */
  async getLedgerReport(companyId, counterpartyId, counterpartyType, dateFrom, dateTo, role, clientId) {
    if (role === 'checker' && counterpartyId !== clientId.toString()) {
        throw new ApiError(403, 'Unauthorized to access this ledger');
    }
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);

    let receiptsQuery = { receiver: companyId, isCancelled: false };
    let paymentsQuery = { payer: companyId, isCancelled: false };
    let openingReceiptsQuery = { receiver: companyId, isCancelled: false, dateTime: { $lt: start } };
    let openingPaymentsQuery = { payer: companyId, isCancelled: false, dateTime: { $lt: start } };

    if (counterpartyType === 'client') {
      receiptsQuery.payer = counterpartyId;
      receiptsQuery.isInternal = false;
      paymentsQuery.receiver = counterpartyId;
      paymentsQuery.isInternal = false;
      openingReceiptsQuery.payer = counterpartyId;
      openingReceiptsQuery.isInternal = false;
      openingPaymentsQuery.receiver = counterpartyId;
      openingPaymentsQuery.isInternal = false;
    } else if (counterpartyType === 'company') {
      receiptsQuery.payer = counterpartyId;
      receiptsQuery.isInternal = true;
      paymentsQuery.receiver = counterpartyId;
      paymentsQuery.isInternal = true;
      openingReceiptsQuery.payer = counterpartyId;
      openingReceiptsQuery.isInternal = true;
      openingPaymentsQuery.receiver = counterpartyId;
      openingPaymentsQuery.isInternal = true;
    } else if (counterpartyType === 'ledger') {
      receiptsQuery.ledger = counterpartyId;
      paymentsQuery.ledger = counterpartyId;
      openingReceiptsQuery.ledger = counterpartyId;
      openingPaymentsQuery.ledger = counterpartyId;
    } else {
      throw new ApiError(400, 'Invalid counterparty type');
    }

    // 1. Calculate Opening Balance
    const [openingReceipts, openingPayments] = await Promise.all([
      Receipt.aggregate([{ $match: openingReceiptsQuery }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: openingPaymentsQuery }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    const openingBalance = (openingReceipts[0]?.total || 0) - (openingPayments[0]?.total || 0);

    // 2. Fetch Transactions in range
    receiptsQuery.dateTime = { $gte: start, $lte: end };
    paymentsQuery.dateTime = { $gte: start, $lte: end };

    const [receipts, payments] = await Promise.all([
      Receipt.find(receiptsQuery).populate('ledger bank payer').sort('dateTime'),
      Payment.find(paymentsQuery).populate('ledger bank receiver').sort('dateTime')
    ]);

    // 3. Combine and Sort
    const allTransactions = [
      ...receipts.map(r => ({ ...r._doc, type: 'Receipt' })),
      ...payments.map(p => ({ ...p._doc, type: 'Payment' }))
    ].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    let runningBalance = openingBalance;
    const ledger = allTransactions.map(t => {
      if (t.type === 'Receipt') runningBalance += t.amount;
      else runningBalance -= t.amount;
      return { ...t, runningBalance };
    });

    return {
      openingBalance,
      ledger,
      closingBalance: runningBalance,
      totalDebit: payments.reduce((sum, p) => sum + p.amount, 0),
      totalCredit: receipts.reduce((sum, r) => sum + r.amount, 0)
    };
  }

  async getCancelReceiptReport(companyId, fromDate, toDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    return await Receipt.find({
      receiver: companyId,
      isCancelled: true,
      dateTime: { $gte: start, $lte: end }
    }).populate('payer ledger bank receivedBy').sort('-dateTime');
  }

  async getCancelPaymentReport(companyId, fromDate, toDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    return await Payment.find({
      payer: companyId,
      isCancelled: true,
      dateTime: { $gte: start, $lte: end }
    }).populate('receiver ledger bank paidBy').sort('-dateTime');
  }

  async getAdminChargesReport(companyId, investmentId, clientId) {
    // 1. Get Investment details to show in header
    const investment = await Investment.findById(investmentId).populate('client lenderCompany');
    
    // 2. We search for receipts linked to this investment's installments that have the "Admin Charges" ledger
    // Or simpler: find all receipts for this receiver/payer with the "Admin Charges" ledger
    const Ledger = require('../models/Ledger');
    const adminLedger = await Ledger.findOne({ ledgerName: /admin charges/i });
    
    if (!adminLedger) throw new ApiError(404, 'Admin Charges ledger not found');

    const receipts = await Receipt.find({
      receiver: companyId,
      payer: clientId,
      ledger: adminLedger._id,
      isCancelled: false
    }).populate('ledger bank receivedBy').sort('dateTime');

    const payments = await Payment.find({
      payer: companyId,
      receiver: clientId,
      ledger: adminLedger._id,
      isCancelled: false
    }).populate('ledger bank paidBy').sort('dateTime');

    return {
      investment,
      receipts,
      payments
    };
  }

  async getPenaltyChargesReport(companyId, loanId, clientId) {
    const loan = await Loan.findById(loanId).populate('client lenderCompany');
    const Ledger = require('../models/Ledger');
    const penaltyLedger = await Ledger.findOne({ ledgerName: /penalty/i });

    if (!penaltyLedger) throw new ApiError(404, 'Penalty ledger not found');

    const receipts = await Receipt.find({
      receiver: companyId,
      payer: clientId,
      ledger: penaltyLedger._id,
      isCancelled: false
    }).populate('ledger bank receivedBy').sort('dateTime');

    const payments = await Payment.find({
      payer: companyId,
      receiver: clientId,
      ledger: penaltyLedger._id,
      isCancelled: false
    }).populate('ledger bank paidBy').sort('dateTime');

    return {
      loan,
      receipts,
      payments
    };
  }

  async getInvestmentReport(companyId, investmentId, role, clientId) {
    const InvestmentInstallment = require('../models/InvestmentInstallment');
    const Payment = require('../models/Payment');
    
    const query = { _id: investmentId };
    if (role === 'checker' && clientId) {
        query.clientId = clientId;
    }

    const investment = await Investment.findOne(query)
      .populate('clientId lenderCompanyId bankId paymentId');
    
    if (!investment) throw new ApiError(404, 'Investment not found');

    const installments = await InvestmentInstallment.find({ 
      investmentId 
    }).populate('receiptId').sort('installmentNumber');

    // Fetch the original payment for the principal (debit)
    const initialPayment = investment.paymentId;

    return {
      investment,
      installments,
      initialPayment,
      totals: {
        principalPaid: installments.filter(i => i.isPaid).reduce((sum, i) => sum + (i.principalEmi || 0), 0),
        interestPaid: installments.filter(i => i.isPaid).reduce((sum, i) => sum + (i.interestEmi || 0), 0),
        totalEmiPaid: installments.filter(i => i.isPaid).reduce((sum, i) => sum + (i.emiAmount || 0), 0)
      }
    };
  }

  async getDashboardStats() {
    const [companies, banks, loans, investments] = await Promise.all([
      Company.find(),
      Bank.find(),
      Loan.find({ isForeClosure: false }),
      Investment.find({ isForeClosure: false })
    ]);

    const totalCash = companies.reduce((acc, c) => acc + (c.currentCashBalance || 0), 0);
    const totalBank = banks.reduce((acc, b) => acc + (b.currentBalance || 0), 0);
    const totalLoan = loans.reduce((acc, l) => acc + (l.totalBalanceAmount || 0), 0);
    const totalInvestment = investments.reduce((acc, i) => acc + (i.totalAmount || 0), 0);

    return {
      totalCash,
      totalBank,
      totalLoan,
      totalInvestment,
      netWorth: totalCash + totalBank,
      activeLoans: loans.length,
      activeInvestments: investments.length
    };
  }

  async getTransactionHistory() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const matchQuery = {
      dateTime: { $gte: thirtyDaysAgo },
      isCancelled: { $ne: true }
    };

    const receipts = await Receipt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateTime" } },
          amount: { $sum: "$amount" }
        }
      }
    ]);

    const payments = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateTime" } },
          amount: { $sum: "$amount" }
        }
      }
    ]);

    // Map to date -> { income, expense }
    const historyMap = {};
    
    // Fill with last 30 days
    for (let i = 0; i <= 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      historyMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }

    receipts.forEach(r => {
      if (historyMap[r._id]) historyMap[r._id].income = r.amount;
    });

    payments.forEach(p => {
      if (historyMap[p._id]) historyMap[p._id].expense = p.amount;
    });

    return Object.values(historyMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getSelfTransferData() {
    const [companies, banks] = await Promise.all([
      Company.find().select('companyName'),
      Bank.find().select('bankName companyId')
    ]);
    return { companies, banks };
  }
}

module.exports = new ReportService();
