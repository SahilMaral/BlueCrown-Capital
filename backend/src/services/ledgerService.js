const Ledger = require('../models/Ledger');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');

const createLedger = async (ledgerData) => {
  const { name } = ledgerData;
  const existingLedger = await Ledger.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingLedger) {
    throw new ApiError(400, 'A ledger with this name already exists');
  }
  return await Ledger.create(ledgerData);
};

const getLedgers = async (query = {}) => {
  return await Ledger.find(query).sort({ name: 1 });
};

const getLedgerById = async (id) => {
  const ledger = await Ledger.findById(id);
  if (!ledger) {
    throw new ApiError(404, 'Ledger not found');
  }
  return ledger;
};

const updateLedger = async (id, ledgerData) => {
  const ledger = await Ledger.findByIdAndUpdate(id, ledgerData, {
    new: true,
    runValidators: true
  });
  if (!ledger) {
    throw new ApiError(404, 'Ledger not found');
  }
  return ledger;
};

const deleteLedger = async (id) => {
  // Check for dependencies (Receipts/Payments)
  const receiptCount = await Receipt.countDocuments({ ledger: id });
  if (receiptCount > 0) {
    throw new ApiError(400, 'Cannot delete ledger: It is used in receipt records');
  }

  const paymentCount = await Payment.countDocuments({ ledger: id });
  if (paymentCount > 0) {
    throw new ApiError(400, 'Cannot delete ledger: It is used in payment records');
  }

  const ledger = await Ledger.findByIdAndDelete(id);
  if (!ledger) {
    throw new ApiError(404, 'Ledger not found');
  }
  return ledger;
};

module.exports = {
  createLedger,
  getLedgers,
  getLedgerById,
  updateLedger,
  deleteLedger
};
