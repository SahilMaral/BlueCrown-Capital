const Joi = require('joi');

const paymentSchema = Joi.object({
  dateTime: Joi.date().required(),
  payer: Joi.string().required(), // Company
  receiver: Joi.string().required(), // Client or Company
  receiverModel: Joi.string().valid('Client', 'Company').required(),
  ledger: Joi.string().required(),
  bank: Joi.string().when('paymentMode', {
    is: Joi.not('Cash'),
    then: Joi.required(),
    otherwise: Joi.string().allow('', null)
  }),
  paymentMode: Joi.string().valid('Cash', 'Bank', 'Cheque', 'Online').required(),
  paymentDetails: Joi.string().allow('', null),
  amount: Joi.number().positive().required(),
  narration: Joi.string().allow('', null),
  isInternal: Joi.boolean().optional(),
  financialYear: Joi.string().optional(),
  reminderId: Joi.string().hex().length(24).allow(null).optional(),
  loanId: Joi.string().hex().length(24).allow(null).optional(),
  paidBy: Joi.string().hex().length(24).optional()
});

const updatePaymentSchema = Joi.object({
  ledger: Joi.string().optional(),
  bank: Joi.string().when('paymentMode', {
    is: Joi.not('Cash'),
    then: Joi.required(),
    otherwise: Joi.string().allow('', null)
  }),
  paymentMode: Joi.string().valid('Cash', 'Bank', 'Cheque', 'Online').optional(),
  paymentDetails: Joi.string().allow('', null),
  narration: Joi.string().allow('', null)
});

module.exports = {
  paymentSchema,
  updatePaymentSchema
};
