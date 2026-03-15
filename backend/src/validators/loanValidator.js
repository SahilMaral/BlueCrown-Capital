const Joi = require('joi');

const loanSchema = Joi.object({
  date: Joi.date(),
  companyId: Joi.string().required(),
  bankId: Joi.string().required(),
  clientId: Joi.string(),
  principalAmount: Joi.number().positive().required(),
  tenure: Joi.number().integer().positive().required(),
  rateOfInterest: Joi.number().positive().required(),
  interestType: Joi.string().valid('Flat', 'Reducing'),
  isInterestOrPrincipal: Joi.number().valid(1, 2),
  dateOfPayment: Joi.date().required(),
  loanType: Joi.string().allow('', null),
  loanReason: Joi.string().allow('', null),
  mortgageDetails: Joi.string().allow('', null),
  guranterDetails: Joi.string().allow('', null),
  totalAmount: Joi.number().positive(),
  totalBalanceAmount: Joi.number().positive(),
  reminders: Joi.array().items(Joi.object({
    emiAmount: Joi.number(),
    reminderDate: Joi.date(),
    isPaid: Joi.boolean()
  }))
});

const updateLoanSchema = Joi.object({
  date: Joi.date(),
  companyId: Joi.string(),
  bankId: Joi.string(),
  clientId: Joi.string(),
  principalAmount: Joi.number().positive(),
  tenure: Joi.number().integer().positive(),
  rateOfInterest: Joi.number().positive(),
  interestType: Joi.string().valid('Flat', 'Reducing'),
  isInterestOrPrincipal: Joi.number().valid(1, 2),
  dateOfPayment: Joi.date(),
  loanType: Joi.string().allow('', null),
  loanReason: Joi.string().allow('', null),
  mortgageDetails: Joi.string().allow('', null),
  guranterDetails: Joi.string().allow('', null),
  totalAmount: Joi.number().positive(),
  totalBalanceAmount: Joi.number().positive(),
  isForeClosure: Joi.boolean(),
  foreClosureDate: Joi.date()
});

module.exports = {
  loanSchema,
  updateLoanSchema,
};
