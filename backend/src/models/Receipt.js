const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  dateTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'payerModel',
    required: true
  },
  payerModel: {
    type: String,
    required: true,
    enum: ['Client', 'Company']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  ledger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank' // Optional, if mode is Cash
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank', 'Cheque', 'Online']
  },
  paymentDetails: {
    type: String
  },
  narration: {
    type: String
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  financialYear: {
    type: String,
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Receipt', receiptSchema);
