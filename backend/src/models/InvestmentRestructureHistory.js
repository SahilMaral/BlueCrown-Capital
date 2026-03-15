const mongoose = require('mongoose');

const investmentRestructureHistorySchema = new mongoose.Schema({
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  oldPrincipal: Number,
  oldTenure: Number,
  oldRoi: Number,
  newPrincipal: Number,
  newTenure: Number,
  newRoi: Number,
  restructureDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InvestmentRestructureHistory', investmentRestructureHistorySchema);
