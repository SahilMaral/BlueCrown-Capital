const Client = require('../models/Client');
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');

const createClient = async (clientData) => {
  // Check if client already exists (Case-insensitive name + mobile)
  const query = {
    $or: [
      { 
        clientName: { $regex: new RegExp(`^${clientData.clientName}$`, 'i') },
        mobileNo: clientData.mobileNo
      }
    ]
  };

  if (clientData.email) {
    query.$or.push({ email: clientData.email });
  }

  const existing = await Client.findOne(query);
  
  if (existing) {
    if (existing.email === clientData.email && clientData.email) {
      throw new ApiError(400, 'A client with this email already exists');
    }
    throw new ApiError(400, 'A client with this name and mobile number already exists');
  }

  return await Client.create(clientData);
};

const getClients = async (query = {}) => {
  return await Client.find(query).sort({ clientName: 1 });
};

const getClientById = async (id) => {
  const client = await Client.findById(id);
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  return client;
};

const updateClient = async (id, clientData) => {
  if (clientData.clientName || clientData.mobileNo || clientData.email) {
    const existingQuery = {
      _id: { $ne: id },
      $or: []
    };

    if (clientData.clientName && clientData.mobileNo) {
      existingQuery.$or.push({
        clientName: { $regex: new RegExp(`^${clientData.clientName}$`, 'i') },
        mobileNo: clientData.mobileNo
      });
    }

    if (clientData.email) {
      existingQuery.$or.push({ email: clientData.email });
    }

    if (existingQuery.$or.length > 0) {
      const existing = await Client.findOne(existingQuery);
      if (existing) {
        throw new ApiError(400, 'Another client with this name/mobile/email combination already exists');
      }
    }
  }

  const client = await Client.findByIdAndUpdate(id, clientData, {
    new: true,
    runValidators: true
  });
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  return client;
};

const deleteClient = async (id) => {
  // 1. Check for dependent Investment records
  const investmentCount = await Investment.countDocuments({ clientId: id });
  if (investmentCount > 0) {
    throw new ApiError(400, 'Cannot delete client: It has associated investments');
  }

  // 2. Check for dependent Loan records
  const loanCount = await Loan.countDocuments({ clientId: id });
  if (loanCount > 0) {
    throw new ApiError(400, 'Cannot delete client: It has associated loans');
  }

  // 3. Check for dependent Receipt records (as payer)
  const receiptCount = await Receipt.countDocuments({ payer: id, payerModel: 'Client' });
  if (receiptCount > 0) {
    throw new ApiError(400, 'Cannot delete client: It is used in receipt records');
  }

  // 4. Check for dependent Payment records (as receiver)
  const paymentCount = await Payment.countDocuments({ receiver: id, receiverModel: 'Client' });
  if (paymentCount > 0) {
    throw new ApiError(400, 'Cannot delete client: It is used in payment records');
  }

  const client = await Client.findByIdAndDelete(id);
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  return client;
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};
