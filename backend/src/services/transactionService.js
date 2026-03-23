const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const Passbook = require('../models/Passbook');
const Bank = require('../models/Bank');
const Company = require('../models/Company');
const Counter = require('../models/Counter');
const Reminder = require('../models/Reminder');
const Investment = require('../models/Investment');
const InvestmentInstallment = require('../models/InvestmentInstallment');
const Loan = require('../models/Loan');
const ApiError = require('../utils/ApiError');
const transactionUtils = require('../utils/transactionUtils');
// PDF generation via puppeteer is not supported in serverless environments.
// The frontend handles receipt printing/PDF export client-side.

const { withTransaction } = require('../utils/dbUtils');
const sendEmail = require('../utils/sendEmail');

/**
 * Create a Receipt with atomic transaction support
 */
const createReceipt = async (receiptData) => {
  return await withTransaction(async (session) => {
    // Frontend sends 'receiver' for Company ID and 'payer' for Client/Company ID
    const { amount, paymentMode, bank, receiver, dateTime, investmentInstallmentId, investmentId, investmentType, pendingLoanData } = receiptData;
    const date = new Date(dateTime || Date.now());
    
    // 1. Generate Receipt Number
    const receiptNumber = await transactionUtils.generateDocumentNumber('receipt', date);
    
    // 2. Create Receipt
    const receiptDocs = await Receipt.create([{
      ...receiptData,
      receiptNumber,
      dateTime: date,
      isCancelled: false
    }], { session });

    const receipt = receiptDocs[0];

    // 3. Handle Module Integrations
    
    // A. Investment Installment
    if (investmentInstallmentId) {
      const installment = await InvestmentInstallment.findById(investmentInstallmentId).session(session);
      if (installment) {
        installment.isPaid = true;
        installment.paymentDate = date;
        installment.receiptId = receipt._id;
        await installment.save({ session });

        // Update Investment balance
        await Investment.findByIdAndUpdate(
          installment.investmentId,
          {
            $inc: {
              balancePrincipal: -installment.principalEmi,
              balanceInterestTotal: -installment.interestEmi
            }
          },
          { session }
        );
      }
    }

    // B. Investment Lumpsum
    if (investmentId && investmentType === 'investment_lumpsum') {
      await InvestmentInstallment.create([{
        investmentId: investmentId,
        installmentNumber: 888, // Lumpsum mark from reference
        emiAmount: amount,
        principalEmi: amount,
        interestEmi: 0,
        dateOfInstallment: date,
        isPaid: true,
        paymentDate: date,
        receiptId: receipt._id
      }], { session });

      await Investment.findByIdAndUpdate(
        investmentId,
        { $inc: { balancePrincipal: -amount } },
        { session }
      );
    }

    // C. Loan Creation (if from receipt)
    if (pendingLoanData) {
      const loanData = typeof pendingLoanData === 'string' ? JSON.parse(pendingLoanData) : pendingLoanData;
      
      const loanDocs = await Loan.create([{
        ...loanData,
        date: date,
        balancePrincipal: loanData.principalAmount,
        totalBalanceAmount: loanData.totalAmount || loanData.principalAmount,
        user: receiptData.receivedBy // Assuming receivedBy is the user
      }], { session });

      const loan = loanDocs[0];

      // Generate Reminders
      if (loan.tenure && loan.dateOfPayment) {
        const reminders = [];
        const startDate = new Date(loan.dateOfPayment);
        for (let i = 0; i < loan.tenure; i++) {
          const rDate = new Date(startDate);
          rDate.setMonth(startDate.getMonth() + i);
          reminders.push({
            loanId: loan._id,
            emiAmount: loan.emiAmount || (loan.principalAmount / loan.tenure), // Fallback calculation
            reminderDate: rDate,
            isPaid: false
          });
        }
        await Reminder.insertMany(reminders, { session });
      }
    }

    // 4. Update Balances & Create Passbook Entry (Inflow)
    await transactionUtils.recordTransaction({
      account: paymentMode === 'Cash' ? receiver : bank,
      accountModel: paymentMode === 'Cash' ? 'Company' : 'Bank',
      amount: parseFloat(amount),
      receiptId: receipt._id,
      dateTime: date,
      isCash: paymentMode === 'Cash'
    }, session);

    return receipt;
  });
};

/**
 * Create a Payment with atomic transaction support
 */
const createPayment = async (paymentData) => {
  return await withTransaction(async (session) => {
    // Frontend sends 'payer' for Company ID and 'receiver' for Client/Company ID
    const { amount, paymentMode, bank, payer, dateTime, reminderId, loanId } = paymentData;
    const date = new Date(dateTime || Date.now());
    
    // 1. Generate Payment Number
    const paymentNumber = await transactionUtils.generateDocumentNumber('payment', date);
    
    // 2. Create Payment
    const paymentDocs = await Payment.create([{
      ...paymentData,
      paymentNumber,
      dateTime: date,
      isCancelled: false
    }], { session });

    const payment = paymentDocs[0];

    // 3. Module Integration (Loan Reminder)
    if (reminderId) {
      await Reminder.findByIdAndUpdate(
        reminderId,
        { isPaid: true, paymentId: payment._id },
        { session }
      );

      if (loanId) {
        await Loan.findByIdAndUpdate(
          loanId,
          { $inc: { totalBalanceAmount: -amount } },
          { session }
        );
      }
    }

    // 4. Update Balances & Create Passbook Entry (Outflow)
    await transactionUtils.recordTransaction({
      account: paymentMode === 'Cash' ? payer : bank,
      accountModel: paymentMode === 'Cash' ? 'Company' : 'Bank',
      amount: -parseFloat(amount), // Outflow
      paymentId: payment._id,
      dateTime: date,
      isCash: paymentMode === 'Cash'
    }, session);

    return payment;
  });
};

/**
 * Update an existing Receipt (Only metadata, no amount/date changes)
 */
const updateReceipt = async (id, updateData) => {
  // We only allow updating fields that don't affect accounting balances
  const allowedUpdates = {
    paymentMode: updateData.paymentMode,
    ledger: updateData.ledger,
    paymentDetails: updateData.paymentDetails,
    narration: updateData.narration
  };

  const receipt = await Receipt.findByIdAndUpdate(
    id,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  );

  return receipt;
};

const createSelfTransfer = async (transferData) => {
  return await withTransaction(async (session) => {
    const { 
      fromAccount, fromModel, 
      toAccount, toModel, 
      amount, dateTime, narration 
    } = transferData;
    
    const date = new Date(dateTime || Date.now());
    const amountVal = parseFloat(amount);

    // 1. Record Outflow from source account
    await transactionUtils.recordTransaction({
      account: fromAccount,
      accountModel: fromModel,
      amount: -amountVal,
      dateTime: date,
      isCash: fromModel === 'Company',
      narration: `Self Transfer to ${toAccount} (${toModel}): ${narration}`
    }, session);

    // 2. Record Inflow to destination account
    await transactionUtils.recordTransaction({
      account: toAccount,
      accountModel: toModel,
      amount: amountVal,
      dateTime: date,
      isCash: toModel === 'Company',
      narration: `Self Transfer from ${fromAccount} (${fromModel}): ${narration}`
    }, session);

    return { success: true, message: "Self transfer completed successfully" };
  });
};

/**
 * Delete a Receipt and revert its impact on balances
 */
const deleteReceipt = async (id) => {
  return await withTransaction(async (session) => {
    // 1. Find the receipt
    const receipt = await Receipt.findById(id).session(session);
    if (!receipt) {
      throw new ApiError(404, 'Receipt not found');
    }

    // 2. Find associated passbook entry (use .lean() so fields are plain JS properties)
    const passbookEntry = await Passbook.findOne({ receipt: id }).session(session).lean();
    if (!passbookEntry) {
       // If no passbook entry, just delete the receipt (shouldn't happen in normal flow)
       await Receipt.findByIdAndDelete(id).session(session);
       return { message: 'Receipt deleted (No passbook entry found)' };
    }

    // 3. Revert Balance
    const account = passbookEntry.account;
    const entryAccountModel = passbookEntry.accountModel;
    const amount = passbookEntry.amount;

    if (entryAccountModel === 'Bank') {
      await Bank.findByIdAndUpdate(
        account,
        { $inc: { currentBalance: -amount } },
        { session }
      );
    } else {
      await Company.findByIdAndUpdate(
        account,
        { $inc: { currentCashBalance: -amount } },
        { session }
      );
    }

    // 4. Delete Passbook Entry
    await Passbook.findByIdAndDelete(passbookEntry._id).session(session);

    // 5. Delete Receipt
    await Receipt.findByIdAndDelete(id).session(session);

    return { message: 'Receipt deleted and balances reverted successfully' };
  });
};

/**
 * Send Receipt Email
 */
const sendReceiptEmail = async (receiptId) => {
  const receipt = await Receipt.findById(receiptId)
    .populate('payer')
    .populate('receiver')
    .populate('receivedBy', 'name');

  if (!receipt) {
    throw new ApiError(404, 'Receipt not found');
  }

  const payerName = receipt.payer?.clientName || receipt.payer?.companyName || 'Valued Client';
  const amountFormatted = receipt.amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #1e293b;">
      <div style="background-color: #0f172a; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">BLUECROWN CAPITAL</h1>
        <p style="color: #94a3b8; margin: 5px 0 0; font-size: 14px;">Receipt Voucher Confirmation</p>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <p style="font-size: 16px; margin-bottom: 25px;">Dear <strong>${payerName}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">Thank you for your payment. We have successfully processed your receipt. Below are the transaction details for your records.</p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Receipt Number</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${receipt.receiptNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${new Date(receipt.dateTime).toLocaleDateString('en-GB')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Mode of Payment</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${receipt.paymentMode}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 15px 0 8px; font-weight: 700; color: #0f172a; font-size: 15px;">TOTAL AMOUNT</td>
              <td style="padding: 15px 0 8px; text-align: right; font-weight: 700; color: #0f172a; font-size: 18px;">${amountFormatted}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
          <strong>Narration:</strong> ${receipt.narration || 'N/A'}
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; text-align: center;">
          This is a computer-generated receipt and does not require a physical signature.
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        &copy; ${new Date().getFullYear()} BlueCrown Capital. All rights reserved.
      </div>
    </div>
  `;

  // PDF attachment is not generated on the server (not supported in serverless).
  // The frontend handles receipt PDF export via the browser's print view.
  const pdfBuffer = null;

  await sendEmail({
    email: receipt.payer?.email || process.env.FROM_EMAIL,
    subject: `Receipt Voucher - ${receipt.receiptNumber}`,
    html,
    attachments: pdfBuffer ? [
      {
        filename: `Receipt_${receipt.receiptNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ] : []
  });
};

module.exports = {
  createReceipt,
  getReceiptById: async (id) => await Receipt.findById(id),
  updateReceipt,
  deleteReceipt,
  sendReceiptEmail,
  createPayment,
  createSelfTransfer,
};
