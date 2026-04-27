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
      if (installments) {
        const parsedInstallments = typeof installments === 'string' ? JSON.parse(installments) : installments;
        if (Array.isArray(parsedInstallments) && parsedInstallments.length > 0) {
          const installmentDocs = parsedInstallments.map(inst => ({
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
      }

      // 4. Record Initial Payment (Outflow from company to client)
      await transactionUtils.recordTransaction({
        account: bankId || lenderCompanyId,
        accountModel: bankId ? 'Bank' : 'Company',
        amount: -parseFloat(principalAmount), // Outflow
        dateTime: date,
        isCash: paymentMode === 'Cash',
        paymentId: paymentId
      }, session);

      return investment[0];
    });
  }

  async getInvestments(userId, role, clientId) {
    const query = {};
    if (role === 'checker' && clientId) {
      query.clientId = clientId;
    }
    const investments = await Investment.find(query)
      .populate('clientId')
      .populate('lenderCompanyId')
      .populate('bankId')
      .sort('-date');
    return investments;
  }

  async getInvestmentById(id, userId, role, clientId) {
    const query = { _id: id };
    if (role === 'checker' && clientId) {
      query.clientId = clientId;
    }
    const investment = await Investment.findOne(query)
      .populate('clientId')
      .populate('lenderCompanyId')
      .populate('bankId');

    if (!investment) {
      throw new ApiError(404, 'Investment not found');
    }
    const installments = await InvestmentInstallment.find({ investmentId: id }).sort('installmentNumber');
    const restructureHistory = await InvestmentRestructureHistory.find({ investmentId: id }).sort('-restructureDate');
    
    return { investment, installments, restructureHistory };
  }

  async getInvestmentInstallments(filters = {}) {
    const { search, startDate, endDate, isPaid } = filters;
    const query = {};

    if (isPaid !== undefined) {
      query.isPaid = isPaid;
    }

    if (startDate || endDate) {
      query.dateOfInstallment = {};
      if (startDate) query.dateOfInstallment.$gte = new Date(startDate);
      if (endDate) query.dateOfInstallment.$lte = new Date(endDate);
    }

    // Search logic would be more complex with population, 
    // for now we fetch and then filter if needed or use aggregation
    const installments = await InvestmentInstallment.find(query)
      .populate({
        path: 'investmentId',
        populate: ['clientId', 'lenderCompanyId']
      })
      .sort('dateOfInstallment');

    if (search) {
      const searchLower = search.toLowerCase();
      return installments.filter(inst => 
        inst.investmentId?.investmentNumber?.toLowerCase().includes(searchLower) ||
        inst.investmentId?.clientId?.clientName?.toLowerCase().includes(searchLower)
      );
    }

    return installments;
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
      investment.updatedBy = userId;
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
        balancePrincipal: 0,
        balanceInterestTotal: 0,
        dateOfInstallment: foreclosureDate,
        isPaid: true,
        paymentDate: foreclosureDate,
        createdBy: userId,
        updatedBy: userId
      }], { session });

      // 4. Record Receipt (Inflow from client to company)
      await transactionUtils.recordTransaction({
        account: bankId || investment.lenderCompanyId,
        accountModel: bankId ? 'Bank' : 'Company',
        amount: parseFloat(foreclosureAmount), // Inflow
        dateTime: foreclosureDate,
        isCash: paymentMode === 'Cash'
      }, session);

      return investment;
    });
  }

  async handleLumpsum(lumpsumData, userId) {
    const { 
      investmentId, 
      lumpsumAmount, 
      lumpsumDate, 
      newBalancePrincipal, 
      newBalanceInterest, 
      newTenure, 
      newEmi,
      paymentMode, 
      bankId,
      installments // New schedule
    } = lumpsumData;

    return await withTransaction(async (session) => {
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) throw new ApiError(404, 'Investment not found');

      // 1. Save History
      await InvestmentRestructureHistory.create([{
        investmentId,
        previousTenure: investment.tenure,
        previousEmi: investment.emiAmount,
        previousBalancePrincipal: investment.balancePrincipal,
        previousBalanceInterestTotal: investment.balanceInterestTotal,
        previousTotalInterest: investment.totalInterest,
        previousInterestType: investment.interestType,
        previousRepaymentSchedule: investment.isInterestOrPrincipal,
        restructureDate: lumpsumDate,
        createdBy: userId
      }], { session });

      // 2. Remove old unpaid installments
      await InvestmentInstallment.deleteMany({ investmentId, isPaid: false }).session(session);

      // 3. Create paid lumpsum installment
      await InvestmentInstallment.create([{
        investmentId,
        installmentNumber: 888, // Lumpsum mark
        emiAmount: lumpsumAmount,
        principalEmi: lumpsumAmount,
        interestEmi: 0,
        balancePrincipal: newBalancePrincipal,
        balanceInterestTotal: newBalanceInterest,
        dateOfInstallment: lumpsumDate,
        isPaid: true,
        paymentDate: lumpsumDate,
        createdBy: userId,
        updatedBy: userId
      }], { session });

      // 4. Insert new installment schedule
      if (installments && Array.isArray(installments)) {
        const installmentDocs = installments.map(inst => ({
          investmentId,
          installmentNumber: inst.installment_number,
          emiAmount: inst.emi_amount,
          principalEmi: inst.principal_emi,
          interestEmi: inst.interest_emi,
          balancePrincipal: inst.balance_principal,
          balanceInterestTotal: inst.balance_interest_total,
          dateOfInstallment: inst.date_of_installment,
          isPaid: false,
          createdBy: userId,
          updatedBy: userId
        }));
        await InvestmentInstallment.create(installmentDocs, { session });
      }

      // 5. Update Investment
      investment.balancePrincipal = newBalancePrincipal;
      investment.balanceInterestTotal = newBalanceInterest;
      investment.tenure = newTenure;
      investment.emiAmount = newEmi;
      investment.updatedBy = userId;
      await investment.save({ session });

      // 6. Record Transaction (Inflow)
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

  async handleRestructure(restructureData, userId) {
    const {
      investmentId,
      restructureDate,
      newTenure,
      newPrincipal,
      repaymentSchedule,
      newEmi,
      newTotalInterest,
      installments
    } = restructureData;

    return await withTransaction(async (session) => {
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) throw new ApiError(404, 'Investment not found');

      // 1. Save History
      await InvestmentRestructureHistory.create([{
        investmentId,
        previousTenure: investment.tenure,
        previousEmi: investment.emiAmount,
        previousBalancePrincipal: investment.balancePrincipal,
        previousBalanceInterestTotal: investment.balanceInterestTotal,
        previousTotalInterest: investment.totalInterest,
        previousInterestType: investment.interestType,
        previousRepaymentSchedule: investment.isInterestOrPrincipal,
        restructureDate: restructureDate,
        createdBy: userId
      }], { session });

      // 2. Remove old unpaid installments
      await InvestmentInstallment.deleteMany({ investmentId, isPaid: false }).session(session);

      // 3. Insert new installment schedule
      if (installments && Array.isArray(installments)) {
        const installmentDocs = installments.map(inst => ({
          investmentId,
          installmentNumber: inst.installment_number,
          emiAmount: inst.emi_amount,
          principalEmi: inst.principal_emi,
          interestEmi: inst.interest_emi,
          balancePrincipal: inst.balance_principal,
          balanceInterestTotal: inst.balance_interest_total,
          dateOfInstallment: inst.date_of_installment,
          isPaid: false,
          createdBy: userId,
          updatedBy: userId
        }));
        await InvestmentInstallment.create(installmentDocs, { session });
      }

      // 4. Update Investment
      investment.balancePrincipal = newPrincipal;
      investment.balanceInterestTotal = newTotalInterest;
      investment.totalInterest = newTotalInterest;
      investment.tenure = newTenure;
      investment.emiAmount = newEmi;
      investment.isInterestOrPrincipal = repaymentSchedule;
      investment.restructureDate = restructureDate;
      investment.updatedBy = userId;
      await investment.save({ session });

      return investment;
    });
  }

  async deleteInvestment(id) {
    const investment = await Investment.findById(id);
    if (!investment) {
      throw new ApiError(404, 'Investment not found');
    }
    await InvestmentInstallment.deleteMany({ investmentId: id });
    await InvestmentRestructureHistory.deleteMany({ investmentId: id });
    await investment.deleteOne();
    return { id };
  }
}

module.exports = new InvestmentService();
