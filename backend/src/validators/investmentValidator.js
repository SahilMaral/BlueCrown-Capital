const Joi = require('joi');

const investmentSchema = Joi.object({
  clientName: Joi.string().required(),
  lenderCompany: Joi.string().required(),
  principalAmount: Joi.number().positive().required(),
  tenureMonths: Joi.number().integer().positive().required(),
  roiMonthly: Joi.number().positive().required(),
  dateOfPayment: Joi.date().required(),
  repaymentSchedule: Joi.string().valid('Only interest', 'Principal + Interest').required(),
});

const updateInvestmentSchema = Joi.object({
  clientName: Joi.string(),
  lenderCompany: Joi.string(),
  principalAmount: Joi.number().positive(),
  tenureMonths: Joi.number().integer().positive(),
  roiMonthly: Joi.number().positive(),
  dateOfPayment: Joi.date(),
  repaymentSchedule: Joi.string().valid('Only interest', 'Principal + Interest'),
});

module.exports = {
  investmentSchema,
  updateInvestmentSchema,
};
