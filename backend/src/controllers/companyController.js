const asyncHandler = require('../utils/asyncHandler');
const companyService = require('../services/companyService');
const ApiResponse = require('../utils/ApiResponse');

const createCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.body);
  res.status(201).json(new ApiResponse(201, company, 'Company created successfully'));
});

const getCompanies = asyncHandler(async (req, res) => {
  const companies = await companyService.getCompanies(req.query);
  res.status(200).json(new ApiResponse(200, companies, 'Companies retrieved successfully'));
});

const getCompanyById = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  res.status(200).json(new ApiResponse(200, company, 'Company retrieved successfully'));
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, company, 'Company updated successfully'));
});

const deleteCompany = asyncHandler(async (req, res) => {
  await companyService.deleteCompany(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Company deleted successfully'));
});

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};
