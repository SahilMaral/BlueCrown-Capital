const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please provide a valid IFSC code (e.g., SBIN0001234)']
  },
  branch: {
    type: String,
    trim: true
  },
  openingBalance: {
    type: Number,
    default: 0,
    min: [0, 'Opening balance cannot be negative']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Bank must belong to a company']
  },
  financialYear: {
    type: String,
    required: [true, 'Financial year is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Sync current balance with opening balance on creation if not provided
bankSchema.pre('save', function(next) {
  if (this.isNew && (!this.currentBalance || this.currentBalance === 0)) {
    this.currentBalance = this.openingBalance;
  }
  next();
});

module.exports = mongoose.model('Bank', bankSchema);
