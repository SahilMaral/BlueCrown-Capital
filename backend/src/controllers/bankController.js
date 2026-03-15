const asyncHandler = require('../utils/asyncHandler');
const bankService = require('../services/bankService');
const ApiResponse = require('../utils/ApiResponse');

const createBank = asyncHandler(async (req, res) => {
  const bank = await bankService.createBank(req.body);
  res.status(201).json(new ApiResponse(201, bank, 'Bank created successfully'));
});

const getBanks = asyncHandler(async (req, res) => {
  const banks = await bankService.getBanks(req.query);
  res.status(200).json(new ApiResponse(200, banks, 'Banks retrieved successfully'));
});

const getBankById = asyncHandler(async (req, res) => {
  const bank = await bankService.getBankById(req.params.id);
  res.status(200).json(new ApiResponse(200, bank, 'Bank details retrieved successfully'));
});

const updateBank = asyncHandler(async (req, res) => {
  const bank = await bankService.updateBank(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, bank, 'Bank updated successfully'));
});

const deleteBank = asyncHandler(async (req, res) => {
  await bankService.deleteBank(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Bank deleted successfully'));
});

module.exports = {
  createBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank
};
