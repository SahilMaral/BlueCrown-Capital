const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true
  },
  address: {
    type: String,
    trim: true
  },
  contactNo: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit contact number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  cashOpeningBalance: {
    type: Number,
    default: 0,
    min: [0, 'Opening balance cannot be negative']
  },
  currentCashBalance: {
    type: Number,
    default: 0
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

companySchema.pre('save', function(next) {
  if (this.isNew && (!this.currentCashBalance || this.currentCashBalance === 0)) {
    this.currentCashBalance = this.cashOpeningBalance;
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
