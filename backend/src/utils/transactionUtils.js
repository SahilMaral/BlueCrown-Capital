const Counter = require('../models/Counter');
const Passbook = require('../models/Passbook');
const Bank = require('../models/Bank');
const Company = require('../models/Company');
const mongoose = require('mongoose');

/**
 * Generate a unique document number (Receipt, Payment, Investment, Loan)
 * Uses pre-configured counters from the Counter management page.
 */
exports.generateDocumentNumber = async (counterName, date) => {
  const investDate = new Date(date);
  const month = investDate.getMonth() + 1;
  const year = investDate.getFullYear();

  let financialYear;
  if (month >= 4) {
    financialYear = `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    financialYear = `${year - 1}-${year.toString().slice(-2)}`;
  }

  // Default prefixes if no counter is configured
  const defaultPrefixes = {
    receipt: 'RCP-',
    payment: 'PAY-',
    investment: 'INV-',
    loan: 'LN-'
  };

  // Try to find an existing counter for this type + year
  let counter = await Counter.findOne({ counterName, financialYear });

  if (!counter) {
    // Auto-create with default prefix so the system keeps working
    const defaultPrefix = defaultPrefixes[counterName] || `${counterName.toUpperCase().slice(0, 3)}-`;
    counter = await Counter.create({
      counterName,
      prefix: defaultPrefix,
      financialYear,
      countNumber: 1
    });
  }

  // Atomically increment the counter and get the CURRENT value before increment
  const updatedCounter = await Counter.findByIdAndUpdate(
    counter._id,
    { $inc: { countNumber: 1 } },
    { new: false } // Return document BEFORE increment
  );

  const num = updatedCounter.countNumber;
  const formattedNum = String(num).padStart(4, '0');
  return `${updatedCounter.prefix}${formattedNum}-${financialYear}`;
};

/**
 * Update Passbook and Balances
 */
exports.recordTransaction = async (options, session) => {
  const {
    account,
    accountModel,
    amount, // Positive for inflow (Receipt), Negative for outflow (Payment)
    receiptId,
    paymentId,
    dateTime = new Date(),
    isCash = false
  } = options;

  let currentBalance = 0;
  let accountDoc;

  if (accountModel === 'Bank') {
    accountDoc = await Bank.findById(account).session(session);
    if (!accountDoc) {
      throw new Error(`Bank account not found with ID: ${account}. Please verify the selection.`);
    }
    currentBalance = accountDoc.currentBalance;
  } else {
    accountDoc = await Company.findById(account).session(session);
    if (!accountDoc) {
      throw new Error(`Company account not found with ID: ${account}. Please verify the selection.`);
    }
    currentBalance = accountDoc.currentCashBalance;
  }

  const openingBalance = currentBalance;
  const closingBalance = openingBalance + amount;

  // Create Passbook Entry
  await Passbook.create([{
    account,
    accountModel,
    receipt: receiptId,
    payment: paymentId,
    openingBalance,
    amount,
    closingBalance,
    isCash,
    dateTime
  }], { session });

  // Update Account Balance
  if (accountModel === 'Bank') {
    accountDoc.currentBalance = closingBalance;
  } else {
    accountDoc.currentCashBalance = closingBalance;
  }
  await accountDoc.save({ session });

  return closingBalance;
};
