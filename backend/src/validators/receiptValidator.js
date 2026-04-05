const Joi = require('joi');

const receiptSchema = Joi.object({
  dateTime: Joi.date().required(),
  payer: Joi.string().required(), // Client or Company ID
  receiver: Joi.string().required(), // Company ID
  ledger: Joi.string().required(),
  bank: Joi.string().when('paymentMode', {
    is: Joi.string().valid('Cash').label('Cash Mode'),
    then: Joi.string().allow('', null).optional(),
    otherwise: Joi.string().required().label('Bank Mode')
  }),
  paymentMode: Joi.string().valid('Cash', 'Bank', 'Cheque', 'Online').required(),
  paymentDetails: Joi.string().allow('', null),
  amount: Joi.number().positive().required(),
  narration: Joi.string().allow('', null),
  isInternal: Joi.boolean().optional(),
  financialYear: Joi.string().optional(),
  payerModel: Joi.string().valid('Client', 'Company').optional(),
  investmentInstallmentId: Joi.string().allow('', null),
  investmentId: Joi.string().allow('', null),
  investmentType: Joi.string().allow('', null),
  pendingLoanData: Joi.any().optional()
});

const updateReceiptSchema = Joi.object({
  ledger: Joi.string(),
  bank: Joi.string().allow('', null),
  paymentMode: Joi.string().valid('Cash', 'Bank', 'Cheque', 'Online'),
  paymentDetails: Joi.string().allow('', null),
  narration: Joi.string().allow('', null)
});

module.exports = {
  receiptSchema,
  updateReceiptSchema,
};
