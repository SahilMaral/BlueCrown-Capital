const Bank = require('../models/Bank');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');

const createBank = async (bankData) => {
  // 1. Unique Account Number Check (Case-insensitive)
  if (bankData.accountNumber) {
    const existingAccount = await Bank.findOne({
      accountNumber: { $regex: new RegExp(`^${bankData.accountNumber}$`, 'i') }
    });
    if (existingAccount) {
      throw new ApiError(400, 'Account number already exists. It must be unique.');
    }
  }

  // 2. IFSC Code Check
  if (bankData.ifscCode && bankData.bankName) {
    const ifscCheck = await Bank.findOne({
      ifscCode: { $regex: new RegExp(`^${bankData.ifscCode}$`, 'i') },
      bankName: { $not: { $regex: new RegExp(`^${bankData.bankName}$`, 'i') } }
    });
    if (ifscCheck) {
      throw new ApiError(400, 'IFSC code already used for another bank. Each bank must have a unique IFSC.');
    }
  }

  return await Bank.create(bankData);
};

const getBanks = async (query = {}) => {
  return await Bank.find(query).sort({ bankName: 1 });
};

const getBankById = async (id) => {
  const bank = await Bank.findById(id);
  if (!bank) {
    throw new ApiError(404, 'Bank details not found');
  }
  return bank;
};

const updateBank = async (id, bankData) => {
  // 1. Unique Account Number Check
  if (bankData.accountNumber) {
    const existingAccount = await Bank.findOne({
      accountNumber: { $regex: new RegExp(`^${bankData.accountNumber}$`, 'i') },
      _id: { $ne: id }
    });
    if (existingAccount) {
      throw new ApiError(400, 'Account number already exists for another bank.');
    }
  }

  // 2. IFSC Code Check
  if (bankData.ifscCode && bankData.bankName) {
    const ifscCheck = await Bank.findOne({
      ifscCode: { $regex: new RegExp(`^${bankData.ifscCode}$`, 'i') },
      bankName: { $not: { $regex: new RegExp(`^${bankData.bankName}$`, 'i') } },
      _id: { $ne: id }
    });
    if (ifscCheck) {
      throw new ApiError(400, 'IFSC code already used for another bank.');
    }
  }

  const bank = await Bank.findByIdAndUpdate(id, bankData, {
    new: true,
    runValidators: true
  });
  if (!bank) {
    throw new ApiError(404, 'Bank not found');
  }
  return bank;
};

const deleteBank = async (id) => {
  // Check dependencies before deletion
  const [payments, receipts] = await Promise.all([
    Payment.countDocuments({ bank: id }),
    Receipt.countDocuments({ bank: id })
  ]);

  if (payments > 0) {
    throw new ApiError(400, 'Cannot delete bank: It is used in payment records.');
  }
  if (receipts > 0) {
    throw new ApiError(400, 'Cannot delete bank: It is used in receipt records.');
  }

  const bank = await Bank.findByIdAndDelete(id);
  if (!bank) {
    throw new ApiError(404, 'Bank not found');
  }
  return bank;
};

module.exports = {
  createBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank
};
