const mongoose = require('mongoose');

const loanHistorySchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  oldPrincipal: Number,
  oldTenure: Number,
  oldRoi: Number,
  newPrincipal: Number,
  newTenure: Number,
  newRoi: Number,
  changeDate: {
    type: Date,
    default: Date.now
  },
  changeType: {
    type: String,
    enum: ['Lumpsum', 'Restructure', 'Foreclosure']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoanHistory', loanHistorySchema);
