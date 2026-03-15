const mongoose = require('mongoose');

const investmentInstallmentSchema = new mongoose.Schema({
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  installmentNumber: {
    type: Number,
    required: true
  },
  emiAmount: {
    type: Number,
    required: true
  },
  principalEmi: {
    type: Number,
    required: true
  },
  interestEmi: {
    type: Number,
    required: true
  },
  balancePrincipal: {
    type: Number
  },
  balanceInterestTotal: {
    type: Number
  },
  dateOfInstallment: {
    type: Date,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentDate: {
    type: Date
  },
  receiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },
  chargesReceiptId: {
    type: String // In SQL it's TEXT, possibly multiple IDs
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InvestmentInstallment', investmentInstallmentSchema);
