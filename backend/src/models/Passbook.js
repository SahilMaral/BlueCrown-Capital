const mongoose = require('mongoose');

const passbookSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'accountModel',
    required: true
  },
  accountModel: {
    type: String,
    required: true,
    enum: ['Bank', 'Company'] // Company ID used for Cash account
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  openingBalance: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true // Positive for Receipts, Negative for Payments
  },
  closingBalance: {
    type: Number,
    required: true
  },
  isCash: {
    type: Boolean,
    default: false
  },
  dateTime: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Passbook', passbookSchema);
