const asyncHandler = require('../utils/asyncHandler');
const clientService = require('../services/clientService');
const ApiResponse = require('../utils/ApiResponse');

const createClient = asyncHandler(async (req, res) => {
  const client = await clientService.createClient(req.body);
  res.status(201).json(new ApiResponse(201, client, 'Client created successfully'));
});

const getClients = asyncHandler(async (req, res) => {
  const clients = await clientService.getClients(req.query);
  res.status(200).json(new ApiResponse(200, clients, 'Clients retrieved successfully'));
});

const getClientById = asyncHandler(async (req, res) => {
  const client = await clientService.getClientById(req.params.id);
  res.status(200).json(new ApiResponse(200, client, 'Client retrieved successfully'));
});

const updateClient = asyncHandler(async (req, res) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, client, 'Client updated successfully'));
});

const deleteClient = asyncHandler(async (req, res) => {
  await clientService.deleteClient(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Client deleted successfully'));
});

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};
