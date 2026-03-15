const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
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
    ref: 'Company',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'receiverModel',
    required: true
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['Client', 'Company']
  },
  ledger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank' // Optional if Cash
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
  paidBy: {
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
  receiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },
  reminderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
