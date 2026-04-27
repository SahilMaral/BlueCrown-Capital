const Joi = require('joi');

const investmentSchema = Joi.object({
  date: Joi.date().required(),
  clientId: Joi.string().required(),
  lenderCompanyId: Joi.string().required(),
  paymentMode: Joi.string().required(),
  bankId: Joi.string().allow('', null),
  principalAmount: Joi.number().positive().required(),
  tenure: Joi.number().integer().positive().required(),
  rateOfInterest: Joi.number().positive().required(),
  interestType: Joi.string().default('Flat'),
  isInterestOrPrincipal: Joi.string().valid('Only interest', 'Principal + Interest').required(),
  dateOfPayment: Joi.date().required(),
  investmentType: Joi.string().required(),
  investmentReason: Joi.string().allow('', null),
  emiAmount: Joi.number().required(),
  balanceInterestTotal: Joi.number().required(),
  mortgageDetails: Joi.string().allow('', null),
  guranterDetails: Joi.string().allow('', null),
  officialAddress: Joi.string().allow('', null),
  installments: Joi.any(), // Will be parsed in service
  paymentId: Joi.string().allow('', null),
});

const updateInvestmentSchema = Joi.object({
  date: Joi.date(),
  clientId: Joi.string(),
  lenderCompanyId: Joi.string(),
  paymentMode: Joi.string(),
  bankId: Joi.string().allow('', null),
  principalAmount: Joi.number().positive(),
  tenure: Joi.number().integer().positive(),
  rateOfInterest: Joi.number().positive(),
  interestType: Joi.string(),
  isInterestOrPrincipal: Joi.string().valid('Only interest', 'Principal + Interest'),
  dateOfPayment: Joi.date(),
  investmentType: Joi.string(),
  investmentReason: Joi.string().allow('', null),
  emiAmount: Joi.number(),
  balanceInterestTotal: Joi.number(),
  mortgageDetails: Joi.string().allow('', null),
  guranterDetails: Joi.string().allow('', null),
  officialAddress: Joi.string().allow('', null),
});

module.exports = {
  investmentSchema,
  updateInvestmentSchema,
};
