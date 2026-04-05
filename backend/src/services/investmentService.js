const Investment = require('../models/Investment');
const InvestmentInstallment = require('../models/InvestmentInstallment');
const InvestmentRestructureHistory = require('../models/InvestmentRestructureHistory');
const ApiError = require('../utils/ApiError');
const transactionUtils = require('../utils/transactionUtils');
const mongoose = require('mongoose');

const { withTransaction } = require('../utils/dbUtils');

class InvestmentService {
  async createInvestment(investmentData, userId) {
    return await withTransaction(async (session) => {
      const {
        date,
        clientId,
        lenderCompanyId,
        paymentMode,
        bankId,
        principalAmount,
        tenure,
        rateOfInterest,
        interestType,
        isInterestOrPrincipal,
        dateOfPayment,
        investmentType,
        investmentReason,
        emiAmount,
        balanceInterestTotal,
        mortgageDetails,
        guranterDetails,
        officialAddress,
        installments,
        paymentId
      } = investmentData;

      // 1. Generate Investment Number
      const { documentNumber: investmentNumber } = await transactionUtils.generateDocumentNumber('investment', date);

      // 2. Create Investment
      const investment = await Investment.create([{
        investmentNumber,
        date,
        clientId,
        lenderCompanyId,
        bankId,
        principalAmount,
        tenure,
        rateOfInterest,
        interestType,
        totalInterest: balanceInterestTotal,
        isInterestOrPrincipal,
        dateOfPayment,
        paymentType: paymentMode,
        emiAmount,
        balancePrincipal: principalAmount,
        balanceInterestTotal,
        investmentType,
        investmentReason,
        mortgageDetails,
        guranterDetails,
        officialAddress,
        paymentId,
        createdBy: userId
      }], { session });

      const investmentId = investment[0]._id;

      // 3. Create Installments
      if (installments && installments.length > 0) {
        const installmentDocs = installments.map(inst => ({
          investmentId,
          installmentNumber: inst.installment_number,
          emiAmount: inst.emi_amount,
          principalEmi: inst.principal_emi,
          interestEmi: inst.interest_emi,
          balancePrincipal: inst.balance_principal,
          balanceInterestTotal: inst.balance_interest_total,
          dateOfInstallment: inst.date_of_installment,
          isPaid: inst.is_paid || false,
          receiptId: inst.receipt_id || null,
          createdBy: userId
        }));
        await InvestmentInstallment.create(installmentDocs, { session });
      }

      return investment[0];
    });
  }

  async getInvestments(userId, role, clientId) {
    const query = {};
    if (role === 'checker' && clientId) {
      query.clientId = clientId;
    }
    const investments = await Investment.find(query).populate('clientId lenderCompanyId bankId').sort('-date');
    return investments;
  }

  async getInvestmentById(id, userId, role, clientId) {
    const query = { _id: id };
    if (role === 'checker' && clientId) {
      query.clientId = clientId;
    }
    const investment = await Investment.findOne(query).populate('clientId lenderCompanyId bankId');
    if (!investment) {
      throw new ApiError(404, 'Investment not found');
    }
    const installments = await InvestmentInstallment.find({ investmentId: id }).sort('installmentNumber');
    return { investment, installments };
  }

  async handleForeclosure(foreclosureData, userId) {
    const { investmentId, foreclosureDate, foreclosureAmount, paymentMode, bankId } = foreclosureData;
    return await withTransaction(async (session) => {
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) throw new ApiError(404, 'Investment not found');

      // 1. Update Investment
      investment.balancePrincipal = 0;
      investment.balanceInterestTotal = 0;
      investment.isForeClosure = true;
      investment.foreClosureDate = foreclosureDate;
      await investment.save({ session });

      // 2. Delete unpaid installments
      await InvestmentInstallment.deleteMany({ investmentId, isPaid: false }).session(session);

      // 3. Create a paid foreclosure installment
      await InvestmentInstallment.create([{
        investmentId,
        installmentNumber: 999, // Special mark
        emiAmount: foreclosureAmount,
        principalEmi: foreclosureAmount,
        interestEmi: 0,
        dateOfInstallment: foreclosureDate,
        isPaid: true,
        paymentDate: foreclosureDate,
        createdBy: userId
      }], { session });

      // 4. Record Payment (Inflow from client to company)
      await transactionUtils.recordTransaction({
        account: bankId || investment.lenderCompanyId,
        accountModel: bankId ? 'Bank' : 'Company',
        amount: parseFloat(foreclosureAmount),
        dateTime: foreclosureDate,
        isCash: paymentMode === 'Cash'
      }, session);

      return investment;
    });
  }

  async handleLumpsum(lumpsumData, userId) {
    const { investmentId, lumpsumAmount, lumpsumDate, newBalance, newTenure, paymentMode, bankId } = lumpsumData;
    return await withTransaction(async (session) => {
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) throw new ApiError(404, 'Investment not found');

      // 1. Save History
      await InvestmentRestructureHistory.create([{
        investmentId,
        oldPrincipal: investment.balancePrincipal,
        oldTenure: investment.tenure,
        oldRoi: investment.rateOfInterest,
        newPrincipal: newBalance,
        newTenure: newTenure,
        newRoi: investment.rateOfInterest,
        restructureDate: lumpsumDate
      }], { session });

      // 2. Update Investment
      investment.balancePrincipal = newBalance;
      investment.tenure = newTenure;
      await investment.save({ session });

      // 3. Handle installments
      const unpaidCount = await InvestmentInstallment.countDocuments({ investmentId, isPaid: false }).session(session);
      
      if (unpaidCount > newTenure) {
        const toDelete = unpaidCount - newTenure;
        const extras = await InvestmentInstallment.find({ investmentId, isPaid: false })
          .sort('-installmentNumber')
          .limit(toDelete)
          .session(session);
        await InvestmentInstallment.deleteMany({ _id: { $in: extras.map(e => e._id) } }).session(session);
      }

      // 4. Create paid lumpsum installment
      await InvestmentInstallment.create([{
        investmentId,
        installmentNumber: 888, // Lumpsum mark
        emiAmount: lumpsumAmount,
        principalEmi: lumpsumAmount,
        interestEmi: 0,
        dateOfInstallment: lumpsumDate,
        isPaid: true,
        paymentDate: lumpsumDate,
        createdBy: userId
      }], { session });

      // 5. Record Transaction (Inflow)
      await transactionUtils.recordTransaction({
        account: bankId || investment.lenderCompanyId,
        accountModel: bankId ? 'Bank' : 'Company',
        amount: parseFloat(lumpsumAmount),
        dateTime: lumpsumDate,
        isCash: paymentMode === 'Cash'
      }, session);

      return investment;
    });
  }

  async deleteInvestment(id) {
    const investment = await Investment.findById(id);
    if (!investment) {
      throw new ApiError(404, 'Investment not found');
    }
    await InvestmentInstallment.deleteMany({ investmentId: id });
    await investment.deleteOne();
    return { id };
  }
}

module.exports = new InvestmentService();
