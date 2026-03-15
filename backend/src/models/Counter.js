const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  counterName: {
    type: String,
    required: true,
    enum: ['receipt', 'payment', 'investment', 'loan']
  },
  prefix: {
    type: String,
    required: true
  },
  countNumber: {
    type: Number,
    default: 1
  },
  financialYear: {
    type: String,
    required: true // e.g., "2024-25"
  }
}, {
  timestamps: true
});

// Compound unique index for name and financial year
counterSchema.index({ counterName: 1, financialYear: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);
