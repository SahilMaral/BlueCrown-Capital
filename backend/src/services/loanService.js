const Loan = require('../models/Loan');
const LoanHistory = require('../models/LoanHistory');
const Reminder = require('../models/Reminder');
const ApiError = require('../utils/ApiError');
const transactionUtils = require('../utils/transactionUtils');
const mongoose = require('mongoose');

const { withTransaction } = require('../utils/dbUtils');

class LoanService {
  async createLoan(loanData, userId) {
    return await withTransaction(async (session) => {
      const {
        date,
        companyId,
        bankId,
        clientId,
        principalAmount,
        tenure,
        rateOfInterest,
        interestType,
        isInterestOrPrincipal,
        dateOfPayment,
        loanType,
        loanReason,
        mortgageDetails,
        guranterDetails,
        totalAmount,
        totalBalanceAmount,
        reminders
      } = loanData;

      // 1. Generate Loan Number
      const loanNumber = await transactionUtils.generateDocumentNumber('loan', date);

      // 2. Create Loan
      const loan = await Loan.create([{
        loanNumber,
        date,
        companyId,
        bankId,
        clientId,
        principalAmount,
        tenure,
        rateOfInterest,
        interestType,
        isInterestOrPrincipal,
        dateOfPayment,
        balancePrincipal: principalAmount,
        totalInterest: totalAmount - principalAmount,
        loanType,
        loanReason,
        mortgageDetails,
        guranterDetails,
        totalAmount,
        totalBalanceAmount,
        user: userId
      }], { session });

      const loanId = loan[0]._id;

      // 3. Create Reminders (Automatic Generation)
      let finalReminders = [];
      if (reminders && reminders.length > 0) {
        finalReminders = reminders.map(rem => ({
          loanId,
          emiAmount: rem.emi_amount || rem.emiAmount,
          reminderDate: rem.reminder_date || rem.reminderDate,
          isPaid: rem.is_paid || rem.isPaid || false
        }));
      } else if (tenure > 0 && dateOfPayment) {
        // Automatically generate monthly reminders based on tenure
        const emiAmount = totalAmount / tenure;
        const startDate = new Date(dateOfPayment);
        
        for (let i = 0; i < tenure; i++) {
          const reminderDate = new Date(startDate);
          reminderDate.setMonth(startDate.getMonth() + i);
          
          finalReminders.push({
            loanId,
            emiAmount: emiAmount,
            reminderDate: reminderDate,
            isPaid: false
          });
        }
      }

      if (finalReminders.length > 0) {
        await Reminder.create(finalReminders, { session });
      }

      return loan[0];
    });
  }

  async getLoans(userId, role, clientId) {
    const query = {};
    if (role === 'checker' && clientId) {
      query.clientId = clientId;
    } else if (role !== 'super_admin' && role !== 'admin' && role !== 'maker') {
      // Default fallback for regular users if needed, though maker/admin/super_admin see all
      query.user = userId;
    }

    const loans = await Loan.find(query).populate('companyId bankId clientId').sort('-date');
    return loans;
  }

  async getLoanById(id, userId, role, clientId) {
    const query = { _id: id };
    if (role === 'checker' && clientId) {
      query.clientId = clientId;
    } else if (role !== 'super_admin' && role !== 'admin' && role !== 'maker') {
      query.user = userId;
    }

    const loan = await Loan.findOne(query).populate('companyId bankId clientId');
    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }
    const reminders = await Reminder.find({ loanId: id }).sort('reminderDate');
    return { loan, reminders };
  }

  async updateLoan(id, updateData, userId) {
    const loan = await Loan.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('companyId bankId clientId');

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }
    return loan;
  }

  async handleForeclosure(foreclosureData, userId) {
    const { loanId, foreclosureDate, foreclosureAmount, paymentMode, bankId } = foreclosureData;
    return await withTransaction(async (session) => {
      const loan = await Loan.findOne({ _id: loanId, user: userId }).session(session);
      if (!loan) throw new ApiError(404, 'Loan not found');

      // 1. Update Loan
      loan.totalBalanceAmount = loan.totalBalanceAmount - parseFloat(foreclosureAmount);
      loan.isForeClosure = true;
      loan.foreClosureDate = foreclosureDate;
      await loan.save({ session });

      // 2. Delete unpaid reminders
      await Reminder.deleteMany({ loanId, isPaid: false }).session(session);

      // 3. Create a paid foreclosure reminder
      await Reminder.create([{
        loanId,
        emiAmount: foreclosureAmount,
        reminderDate: foreclosureDate,
        isPaid: true
      }], { session });

      // 4. Record Transaction (Inflow)
      await transactionUtils.recordTransaction({
        account: bankId || loan.companyId,
        accountModel: bankId ? 'Bank' : 'Company',
        amount: parseFloat(foreclosureAmount),
        dateTime: foreclosureDate,
        isCash: paymentMode === 'Cash'
      }, session);

      return loan;
    });
  }

  async handleLumpsum(lumpsumData, userId) {
    const { loanId, lumpsumAmount, lumpsumDate, newBalance, newTenure, paymentMode, bankId } = lumpsumData;
    return await withTransaction(async (session) => {
      const loan = await Loan.findOne({ _id: loanId, user: userId }).session(session);
      if (!loan) throw new ApiError(404, 'Loan not found');

      // 1. Update Loan
      loan.totalBalanceAmount = newBalance;
      loan.tenure = newTenure;
      await loan.save({ session });

      // 2. Handle reminders
      const unpaidCount = await Reminder.countDocuments({ loanId, isPaid: false }).session(session);
      
      if (unpaidCount > newTenure) {
        const toDelete = unpaidCount - newTenure;
        const extras = await Reminder.find({ loanId, isPaid: false })
          .sort('-reminderDate')
          .limit(toDelete)
          .session(session);
        await Reminder.deleteMany({ _id: { $in: extras.map(e => e._id) } }).session(session);
      }

      // 3. Create paid lumpsum reminder
      await Reminder.create([{
        loanId,
        emiAmount: lumpsumAmount,
        reminderDate: lumpsumDate,
        isPaid: true
      }], { session });

      // 4. Record Transaction (Inflow)
      await transactionUtils.recordTransaction({
        account: bankId || loan.companyId,
        accountModel: bankId ? 'Bank' : 'Company',
        amount: parseFloat(lumpsumAmount),
        dateTime: lumpsumDate,
        isCash: paymentMode === 'Cash'
      }, session);

      return loan;
    });
  }

  async getReminders(userId, role, clientId) {
    const query = {};
    if (role === 'checker' && clientId) {
      query.clientId = clientId;
    } else if (role !== 'super_admin' && role !== 'admin' && role !== 'maker') {
      query.user = userId;
    }

    // 1. Get all loans based on permissions
    const loans = await Loan.find(query).select('_id');
    const loanIds = loans.map(loan => loan._id);

    // 2. Get reminders for those loans
    const reminders = await Reminder.find({ loanId: { $in: loanIds } })
      .populate({
        path: 'loanId',
        populate: { path: 'companyId bankId clientId' }
      })
      .sort('reminderDate');
    return reminders;
  }

  async deleteLoan(id, userId) {
    const loan = await Loan.findOne({ _id: id, user: userId });
    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }
    await Reminder.deleteMany({ loanId: id });
    await loan.deleteOne();
    return { id };
  }
}

module.exports = new LoanService();
