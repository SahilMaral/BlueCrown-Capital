const Client = require('../models/Client');
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');

const createClient = async (clientData) => {
  // Check if client already exists
  const query = {
    $or: [
      { 
        clientName: { $regex: new RegExp(`^${clientData.clientName.trim()}$`, 'i') },
        mobileNo: clientData.mobileNo,
        companyName: clientData.companyName ? { $regex: new RegExp(`^${clientData.companyName.trim()}$`, 'i') } : { $exists: false }
      }
    ]
  };

  if (clientData.email) {
    query.$or.push({ email: { $regex: new RegExp(`^${clientData.email.trim()}$`, 'i') } });
  }

  const existingClient = await Client.findOne(query);
  if (existingClient) {
    throw new ApiError(400, 'Client with this name/mobile or email already exists');
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

const updateClient = async (id, updateData) => {
  const client = await Client.findById(id);
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  // If name, mobile, or email is being updated, check for duplicates
  if (updateData.clientName || updateData.mobileNo || updateData.email || updateData.companyName) {
    const checkName = (updateData.clientName || client.clientName).trim();
    const checkMobile = updateData.mobileNo || client.mobileNo;
    const checkEmail = (updateData.email || client.email)?.trim();
    const checkCompany = (updateData.companyName || client.companyName)?.trim();

    const query = {
      _id: { $ne: id },
      $or: [
        { 
          clientName: { $regex: new RegExp(`^${checkName}$`, 'i') },
          mobileNo: checkMobile,
          companyName: checkCompany ? { $regex: new RegExp(`^${checkCompany}$`, 'i') } : { $exists: false }
        }
      ]
    };

    if (checkEmail) {
      query.$or.push({ email: { $regex: new RegExp(`^${checkEmail}$`, 'i') } });
    }

    const existingClient = await Client.findOne(query);
    if (existingClient) {
      throw new ApiError(400, 'Another client with this name/mobile or email already exists');
    }
  }

  Object.assign(client, updateData);
  return await client.save();
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
