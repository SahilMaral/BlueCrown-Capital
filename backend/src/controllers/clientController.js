const asyncHandler = require('../utils/asyncHandler');
const clientService = require('../services/clientService');
const ApiResponse = require('../utils/ApiResponse');

// Helper to convert memory-storage multer files to base64 data URIs
// (disk storage is not available in Vercel serverless environments)
const processClientFiles = (files) => {
  if (!files || files.length === 0) return [];

  return files.map(file => {
    const base64 = file.buffer.toString('base64');
    const mimeType = file.mimetype;
    return `data:${mimeType};base64,${base64}`;
  });
};

const createClient = asyncHandler(async (req, res) => {
  let client = await clientService.createClient(req.body);
  
  if (req.files && req.files.length > 0) {
    const documentPaths = processClientFiles(req.files);
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
    const newDocPaths = processClientFiles(req.files);
    const existingClient = await clientService.getClientById(req.params.id);
    updateData.documents = [...(existingClient.documents || []), ...newDocPaths];
  }

  const client = await clientService.updateClient(req.params.id, updateData);
  res.status(200).json(new ApiResponse(200, client, 'Client updated successfully'));
});

const deleteClient = asyncHandler(async (req, res) => {
  await clientService.deleteClient(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Client deleted successfully'));
});

const deleteDocument = asyncHandler(async (req, res) => {
  const { clientId, index } = req.params;
  const client = await clientService.getClientById(clientId);
  
  if (!client.documents || !client.documents[index]) {
    return res.status(404).json(new ApiResponse(404, null, 'Document not found'));
  }

  // Documents are stored as base64 data URIs in the DB — just remove from array
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
