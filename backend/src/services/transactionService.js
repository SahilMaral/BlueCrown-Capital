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
    const { documentNumber: receiptNumber, financialYear } = await transactionUtils.generateDocumentNumber('receipt', date);
    
    // 2. Create Receipt
    const receiptDocs = await Receipt.create([{
      ...receiptData,
      receiptNumber,
      financialYear,
      payerModel: receiptData.isInternal ? 'Company' : 'Client',
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
    const { documentNumber: paymentNumber, financialYear } = await transactionUtils.generateDocumentNumber('payment', date);
    
    // 2. Create Payment
    const paymentDocs = await Payment.create([{
      ...paymentData,
      paymentNumber,
      financialYear,
      receiverModel: paymentData.isInternal ? 'Company' : 'Client',
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
 * Update an existing Receipt (Only metadata, but handles Bank/Cash shift if mode changes)
 */
const updateReceipt = async (id, updateData) => {
  return await withTransaction(async (session) => {
    // 1. Get original receipt
    const receipt = await Receipt.findById(id).session(session);
    if (!receipt) throw new ApiError(404, 'Receipt not found');
    if (receipt.isCancelled) throw new ApiError(400, 'Cannot update a cancelled receipt');

    const amount = receipt.amount;
    const oldMode = receipt.paymentMode;
    const oldBank = receipt.bank?.toString();
    const receiver = receipt.receiver;

    const newMode = updateData.paymentMode || oldMode;
    const newBank = updateData.bank || receipt.bank;

    // 2. Determine if a balance shift is needed
    // Account for a receipt is either the Receiver (if Cash) or the Bank
    const oldAccount = oldMode === 'Cash' ? receiver : receipt.bank;
    const oldAccountModel = oldMode === 'Cash' ? 'Company' : 'Bank';

    const newAccount = newMode === 'Cash' ? receiver : newBank;
    const newAccountModel = newMode === 'Cash' ? 'Company' : 'Bank';

    const accountChanged = oldAccount.toString() !== newAccount.toString() || oldAccountModel !== newAccountModel;

    if (accountChanged) {
      // Validation: If new mode is not Cash, newBank must be provided
      if (newMode !== 'Cash' && !newBank) {
        throw new ApiError(400, 'Bank account is required for the selected payment mode');
      }

      // a. Revert balance from OLD account
      if (oldAccountModel === 'Bank') {
        await Bank.findByIdAndUpdate(oldAccount, { $inc: { currentBalance: -amount } }, { session });
      } else {
        await Company.findByIdAndUpdate(oldAccount, { $inc: { currentCashBalance: -amount } }, { session });
      }

      // b. Apply balance to NEW account
      if (newAccountModel === 'Bank') {
        await Bank.findByIdAndUpdate(newAccount, { $inc: { currentBalance: amount } }, { session });
      } else {
        await Company.findByIdAndUpdate(newAccount, { $inc: { currentCashBalance: amount } }, { session });
      }

      // c. Update Passbook entry
      await Passbook.findOneAndUpdate(
        { receipt: id },
        { 
          account: newAccount, 
          accountModel: newAccountModel,
          isCash: newMode === 'Cash'
        },
        { session }
      );
    }

    // 3. Update the Receipt
    const allowedUpdates = {
      paymentMode: newMode,
      bank: newMode === 'Cash' ? undefined : newBank,
      ledger: updateData.ledger,
      paymentDetails: updateData.paymentDetails,
      narration: updateData.narration
    };

    Object.assign(receipt, allowedUpdates);
    await receipt.save({ session });

    return receipt;
  });
};

/**
 * Update an existing Payment (Only metadata, but handles Bank/Cash shift if mode changes)
 */
const updatePayment = async (id, updateData) => {
  return await withTransaction(async (session) => {
    // 1. Get original payment
    const payment = await Payment.findById(id).session(session);
    if (!payment) throw new ApiError(404, 'Payment not found');
    if (payment.isCancelled) throw new ApiError(400, 'Cannot update a cancelled payment');

    const amount = payment.amount;
    const oldMode = payment.paymentMode;
    const oldBank = payment.bank?.toString();
    const payer = payment.payer; // Company ID

    const newMode = updateData.paymentMode || oldMode;
    const newBank = updateData.bank || payment.bank;

    // 2. Determine if a balance shift is needed
    // Account for a payment is either the Payer (if Cash) or the Bank
    const oldAccount = oldMode === 'Cash' ? payer : payment.bank;
    const oldAccountModel = oldMode === 'Cash' ? 'Company' : 'Bank';

    const newAccount = newMode === 'Cash' ? payer : newBank;
    const newAccountModel = newMode === 'Cash' ? 'Company' : 'Bank';

    const accountChanged = oldAccount.toString() !== newAccount.toString() || oldAccountModel !== newAccountModel;

    if (accountChanged) {
      // Validation: If new mode is not Cash, newBank must be provided
      if (newMode !== 'Cash' && !newBank) {
        throw new ApiError(400, 'Bank account is required for the selected payment mode');
      }

      // a. Revert balance from OLD account (Inflow the amount back)
      if (oldAccountModel === 'Bank') {
        await Bank.findByIdAndUpdate(oldAccount, { $inc: { currentBalance: amount } }, { session });
      } else {
        await Company.findByIdAndUpdate(oldAccount, { $inc: { currentCashBalance: amount } }, { session });
      }

      // b. Apply balance to NEW account (Outflow the amount)
      if (newAccountModel === 'Bank') {
        await Bank.findByIdAndUpdate(newAccount, { $inc: { currentBalance: -amount } }, { session });
      } else {
        await Company.findByIdAndUpdate(newAccount, { $inc: { currentCashBalance: -amount } }, { session });
      }

      // c. Update Passbook entry
      await Passbook.findOneAndUpdate(
        { payment: id },
        { 
          account: newAccount, 
          accountModel: newAccountModel,
          isCash: newMode === 'Cash'
        },
        { session }
      );
    }

    // 3. Update the Payment
    const allowedUpdates = {
      paymentMode: newMode,
      bank: newMode === 'Cash' ? undefined : newBank,
      ledger: updateData.ledger,
      paymentDetails: updateData.paymentDetails,
      narration: updateData.narration
    };

    Object.assign(payment, allowedUpdates);
    await payment.save({ session });

    return payment;
  });
};

const createSelfTransfer = async (transferData) => {
  return await withTransaction(async (session) => {
    const { 
      payerCompanyId, receiverCompanyId,
      payerPaymentMode, receiverPaymentMode,
      payerBankId, receiverBankId,
      payerLedgerId, receiverLedgerId,
      amount, dateTime, narration, paymentDetails,
      processedBy // Added to track who performed the transfer
    } = transferData;
    
    const date = new Date(dateTime || Date.now());
    const amountVal = parseFloat(amount);

    // 1. Generate Document Numbers
    const { documentNumber: paymentNumber, financialYear: pFY } = await transactionUtils.generateDocumentNumber('payment', date);
    const { documentNumber: receiptNumber, financialYear: rFY } = await transactionUtils.generateDocumentNumber('receipt', date);

    // 2. Create Payment Document (Source)
    const paymentDocs = await Payment.create([{
      paymentNumber,
      dateTime: date,
      payer: payerCompanyId,
      receiver: receiverCompanyId,
      receiverModel: 'Company',
      ledger: payerLedgerId,
      bank: payerPaymentMode === 'Cash' ? undefined : payerBankId,
      paymentMode: payerPaymentMode,
      paymentDetails,
      narration: `Self Transfer to ${receiverCompanyId}: ${narration}`,
      paidBy: processedBy,
      amount: amountVal,
      isInternal: true,
      financialYear: pFY
    }], { session });
    const payment = paymentDocs[0];

    // 3. Create Receipt Document (Destination)
    const receiptDocs = await Receipt.create([{
      receiptNumber,
      dateTime: date,
      payer: payerCompanyId,
      payerModel: 'Company',
      receiver: receiverCompanyId,
      ledger: receiverLedgerId,
      bank: receiverPaymentMode === 'Cash' ? undefined : receiverBankId,
      paymentMode: receiverPaymentMode,
      paymentDetails,
      narration: `Self Transfer from ${payerCompanyId}: ${narration}`,
      receivedBy: processedBy,
      amount: amountVal,
      isInternal: true,
      financialYear: rFY,
      paymentId: payment._id // Link to payment
    }], { session });
    const receipt = receiptDocs[0];

    // 4. Update Payment with link to Receipt
    payment.receiptId = receipt._id;
    await payment.save({ session });

    // 5. Record Passbook Entries & Update Balances
    
    // Outflow from source
    await transactionUtils.recordTransaction({
      account: payerPaymentMode === 'Cash' ? payerCompanyId : payerBankId,
      accountModel: payerPaymentMode === 'Cash' ? 'Company' : 'Bank',
      amount: -amountVal,
      paymentId: payment._id,
      dateTime: date,
      isCash: payerPaymentMode === 'Cash'
    }, session);

    // Inflow to destination
    await transactionUtils.recordTransaction({
      account: receiverPaymentMode === 'Cash' ? receiverCompanyId : receiverBankId,
      accountModel: receiverPaymentMode === 'Cash' ? 'Company' : 'Bank',
      amount: amountVal,
      receiptId: receipt._id,
      dateTime: date,
      isCash: receiverPaymentMode === 'Cash'
    }, session);

    return { 
      success: true, 
      message: "Self transfer completed successfully",
      paymentId: payment._id,
      receiptId: receipt._id
    };
  });
};

/**
 * Cancel a Receipt and revert its impact on balances and modules
 */
const cancelReceipt = async (id) => {
  return await withTransaction(async (session) => {
    // 1. Find the receipt
    const receipt = await Receipt.findById(id).session(session);
    if (!receipt) {
      throw new ApiError(404, 'Receipt not found');
    }

    if (receipt.isCancelled) {
      throw new ApiError(400, 'Receipt is already cancelled');
    }

    // 2. Revert Balance via Passbook Entry
    const passbookEntry = await Passbook.findOne({ receipt: id }).session(session).lean();
    if (passbookEntry) {
      const { account, accountModel, amount } = passbookEntry;

      if (accountModel === 'Bank') {
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

      // Delete Passbook Entry
      await Passbook.findByIdAndDelete(passbookEntry._id).session(session);
    }

    // 3. Revert Module Integrations
    
    // A. Investment Installment
    if (receipt.investmentInstallmentId) {
      const installment = await InvestmentInstallment.findById(receipt.investmentInstallmentId).session(session);
      if (installment) {
        installment.isPaid = false;
        installment.paymentDate = null;
        installment.receiptId = null;
        await installment.save({ session });

        // Update Investment balance (re-increase balance)
        await Investment.findByIdAndUpdate(
          installment.investmentId,
          {
            $inc: {
              balancePrincipal: installment.principalEmi,
              balanceInterestTotal: installment.interestEmi
            }
          },
          { session }
        );
      }
    }

    // B. Investment Lumpsum
    if (receipt.investmentId && receipt.investmentType === 'investment_lumpsum') {
      await InvestmentInstallment.findOneAndDelete({ receiptId: id }).session(session);
      await Investment.findByIdAndUpdate(
        receipt.investmentId,
        { $inc: { balancePrincipal: receipt.amount } },
        { session }
      );
    }

    // C. Loan Cancellation (if created from this receipt)
    // In reference project, canceling a primary receipt might delete the loan?
    // Let's check for any loans created with this receipt as "receiptId" (if we store it)
    // The current createReceipt doesn't store receiptId on the Loan model, but uses pendingLoanData.
    // If we want to be safe, we'd need a link. For now, we'll focus on the balance.

    // 4. Mark Receipt as Cancelled
    receipt.isCancelled = true;
    await receipt.save({ session });

    return { message: 'Receipt cancelled and balances reverted successfully' };
  });
};

/**
 * Cancel a Payment and revert its impact on balances
 */
const cancelPayment = async (id) => {
  return await withTransaction(async (session) => {
    // 1. Find the payment
    const payment = await Payment.findById(id).session(session);
    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    if (payment.isCancelled) {
      throw new ApiError(400, 'Payment is already cancelled');
    }

    // 2. Revert Balance via Passbook Entry (Inflow back)
    const passbookEntry = await Passbook.findOne({ payment: id }).session(session).lean();
    if (passbookEntry) {
      const { account, accountModel, amount } = passbookEntry;

      // For Payment, amount in passbook is negative. To revert it, subtract it (effectively adds positive)
      if (accountModel === 'Bank') {
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

      // Delete Passbook Entry
      await Passbook.findByIdAndDelete(passbookEntry._id).session(session);
    }

    // 3. Revert Module Integrations
    if (payment.reminderId) {
      await Reminder.findByIdAndUpdate(
        payment.reminderId,
        { isPaid: false, paymentId: null },
        { session }
      );
    }

    // 4. Mark Payment as Cancelled
    payment.isCancelled = true;
    await payment.save({ session });

    return { message: 'Payment cancelled and balances reverted successfully' };
  });
};

/**
 * Send Receipt Email
 */
const sendReceiptEmail = async (receiptId, attachment) => {
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

  // PDF attachment handling
  const pdfAttachments = [];
  if (attachment) {
    pdfAttachments.push({
      filename: attachment.originalname || `Receipt_${receipt.receiptNumber}.pdf`,
      content: attachment.buffer,
      contentType: 'application/pdf'
    });
  }

  await sendEmail({
    email: receipt.payer?.email || process.env.FROM_EMAIL,
    subject: `Receipt Voucher - ${receipt.receiptNumber}`,
    html,
    attachments: pdfAttachments
  });
};

/**
 * Send Payment Email
 */
const sendPaymentEmail = async (paymentId, attachment) => {
  const payment = await Payment.findById(paymentId)
    .populate('payer')
    .populate('receiver')
    .populate('paidBy', 'name');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  const receiverName = payment.receiver?.clientName || payment.receiver?.companyName || 'Valued Client';
  const amountFormatted = payment.amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #1e293b;">
      <div style="background-color: #0f172a; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">BLUECROWN CAPITAL</h1>
        <p style="color: #94a3b8; margin: 5px 0 0; font-size: 14px;">Payment Voucher Confirmation</p>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <p style="font-size: 16px; margin-bottom: 25px;">To <strong>${receiverName}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">We have processed a payment in your favor. Below are the transaction details for your records.</p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Payment Number</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${payment.paymentNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${new Date(payment.dateTime).toLocaleDateString('en-GB')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Mode</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${payment.paymentMode}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 15px 0 8px; font-weight: 700; color: #0f172a; font-size: 15px;">TOTAL AMOUNT</td>
              <td style="padding: 15px 0 8px; text-align: right; font-weight: 700; color: #0f172a; font-size: 18px;">${amountFormatted}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
          <strong>Narration:</strong> ${payment.narration || 'N/A'}
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; text-align: center;">
          This is a computer-generated voucher and does not require a physical signature.
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        &copy; ${new Date().getFullYear()} BlueCrown Capital. All rights reserved.
      </div>
    </div>
  `;

  // PDF attachment handling
  const pdfAttachments = [];
  if (attachment) {
    pdfAttachments.push({
      filename: `Payment_${payment.paymentNumber}.pdf`,
      content: attachment.buffer,
      contentType: 'application/pdf'
    });
  }

  await sendEmail({
    email: payment.receiver?.email || process.env.FROM_EMAIL,
    subject: `Payment Voucher - ${payment.paymentNumber}`,
    html,
    attachments: pdfAttachments
  });
};

module.exports = {
  createReceipt,
  getReceiptById: async (id) => await Receipt.findById(id),
  updateReceipt,
  cancelReceipt,
  sendReceiptEmail,
  createPayment,
  getPaymentById: async (id) => await Payment.findById(id),
  updatePayment,
  cancelPayment,
  sendPaymentEmail,
  createSelfTransfer,
  checkBalance: async (entityId, accountModel, amount) => {
    let balance = 0;
    if (accountModel === 'Bank') {
      const bank = await Bank.findById(entityId);
      balance = bank ? bank.currentBalance : 0;
    } else {
      const company = await Company.findById(entityId);
      balance = company ? company.currentCashBalance : 0;
    }
    return {
      isSufficient: balance >= amount,
      balance,
      message: balance >= amount ? 'Sufficient balance' : `Insufficient balance. Available: ₹${balance.toLocaleString()}`
    };
  }
};
