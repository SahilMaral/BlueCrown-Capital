const asyncHandler = require('../utils/asyncHandler');
const ledgerService = require('../services/ledgerService');
const ApiResponse = require('../utils/ApiResponse');

const createLedger = asyncHandler(async (req, res) => {
  const ledger = await ledgerService.createLedger(req.body);
  res.status(201).json(new ApiResponse(201, ledger, 'Ledger created successfully'));
});

const getLedgers = asyncHandler(async (req, res) => {
  const ledgers = await ledgerService.getLedgers(req.query);
  res.status(200).json(new ApiResponse(200, ledgers, 'Ledgers retrieved successfully'));
});

const getLedgerById = asyncHandler(async (req, res) => {
  const ledger = await ledgerService.getLedgerById(req.params.id);
  res.status(200).json(new ApiResponse(200, ledger, 'Ledger retrieved successfully'));
});

const updateLedger = asyncHandler(async (req, res) => {
  const ledger = await ledgerService.updateLedger(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, ledger, 'Ledger updated successfully'));
});

const deleteLedger = asyncHandler(async (req, res) => {
  await ledgerService.deleteLedger(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Ledger deleted successfully'));
});

module.exports = {
  createLedger,
  getLedgers,
  getLedgerById,
  updateLedger,
  deleteLedger
};
