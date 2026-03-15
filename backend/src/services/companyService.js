const Company = require('../models/Company');
const Bank = require('../models/Bank');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');

const createCompany = async (companyData) => {
  // Check if company already exists (Case-insensitive)
  const existing = await Company.findOne({ 
    companyName: { $regex: new RegExp(`^${companyData.companyName}$`, 'i') } 
  });
  if (existing) {
    throw new ApiError(400, 'A company with this name already exists');
  }
  return await Company.create(companyData);
};

const getCompanies = async (query = {}) => {
  return await Company.find(query).sort({ companyName: 1 });
};

const getCompanyById = async (id) => {
  const company = await Company.findById(id);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  return company;
};

const updateCompany = async (id, companyData) => {
  if (companyData.companyName) {
    const existing = await Company.findOne({ 
      _id: { $ne: id },
      companyName: { $regex: new RegExp(`^${companyData.companyName}$`, 'i') } 
    });
    if (existing) {
      throw new ApiError(400, 'A company with this name already exists');
    }
  }

  const company = await Company.findByIdAndUpdate(id, companyData, {
    new: true,
    runValidators: true
  });
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  return company;
};

const deleteCompany = async (id) => {
  // 1. Check for dependent Bank records
  const bankCount = await Bank.countDocuments({ companyId: id });
  if (bankCount > 0) {
    throw new ApiError(400, 'Cannot delete company: It has associated bank accounts');
  }

  // 2. Check for dependent Receipt records (as receiver or payer)
  const receiptCount = await Receipt.countDocuments({ 
    $or: [
      { receiver: id },
      { payer: id, payerModel: 'Company' }
    ]
  });
  if (receiptCount > 0) {
    throw new ApiError(400, 'Cannot delete company: It is used in receipt records');
  }

  // 3. Check for dependent Payment records (as payer or receiver)
  const paymentCount = await Payment.countDocuments({
    $or: [
      { payer: id },
      { receiver: id, receiverModel: 'Company' }
    ]
  });
  if (paymentCount > 0) {
    throw new ApiError(400, 'Cannot delete company: It is used in payment records');
  }

  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  return company;
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};
