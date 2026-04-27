const mongoose = require('mongoose');

const investmentRestructureHistorySchema = new mongoose.Schema({
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  previousTenure: Number,
  previousEmi: Number,
  previousBalancePrincipal: Number,
  previousBalanceInterestTotal: Number,
  previousTotalInterest: Number,
  previousInterestType: String,
  previousRepaymentSchedule: String,
  restructureDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InvestmentRestructureHistory', investmentRestructureHistorySchema);
