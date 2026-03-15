const Bank = require('../models/Bank');
const ApiError = require('../utils/ApiError');

const createBank = async (bankData) => {
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
