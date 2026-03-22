const asyncHandler = require('../utils/asyncHandler');
const clientService = require('../services/clientService');
const ApiResponse = require('../utils/ApiResponse');
const fs = require('fs');
const path = require('path');

// Helper to move files from temp to client folder
const processClientFiles = (clientId, files) => {
  if (!files || files.length === 0) return [];

  const clientDir = path.join(__dirname, '../../uploads/clients', clientId.toString());
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  return files.map(file => {
    const newPath = path.join(clientDir, file.filename);
    fs.renameSync(file.path, newPath);
    return `/uploads/clients/${clientId}/${file.filename}`;
  });
};

const createClient = asyncHandler(async (req, res) => {
  let client = await clientService.createClient(req.body);
  
  if (req.files && req.files.length > 0) {
    const documentPaths = processClientFiles(client._id, req.files);
    client = await clientService.updateClient(client._id, { 
      documents: documentPaths 
    });
  }

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
  let updateData = { ...req.body };
  
  if (req.files && req.files.length > 0) {
    const newDocPaths = processClientFiles(req.params.id, req.files);
    const existingClient = await clientService.getClientById(req.params.id);
    updateData.documents = [...(existingClient.documents || []), ...newDocPaths];
  }

  const client = await clientService.updateClient(req.params.id, updateData);
  res.status(200).json(new ApiResponse(200, client, 'Client updated successfully'));
});

const deleteClient = asyncHandler(async (req, res) => {
  // Get client to find folder path
  const client = await clientService.getClientById(req.params.id);
  
  await clientService.deleteClient(req.params.id);

  // Remove client directory if it exists
  const clientDir = path.join(__dirname, '../../uploads/clients', req.params.id);
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true, force: true });
  }

  res.status(200).json(new ApiResponse(200, null, 'Client deleted successfully'));
});

const deleteDocument = asyncHandler(async (req, res) => {
  const { clientId, index } = req.params;
  const client = await clientService.getClientById(clientId);
  
  if (!client.documents || !client.documents[index]) {
    return res.status(404).json(new ApiResponse(404, null, 'Document not found'));
  }

  const docPath = client.documents[index];
  const fullPath = path.join(__dirname, '../../', docPath);

  // Remove physical file
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  // Update record
  const updatedDocuments = client.documents.filter((_, i) => i !== parseInt(index));
  await clientService.updateClient(clientId, { documents: updatedDocuments });

  res.status(200).json(new ApiResponse(200, null, 'Document deleted successfully'));
});

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  deleteDocument
};
