const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  emiAmount: {
    type: Number,
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  receiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);
