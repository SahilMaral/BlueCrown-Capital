const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema(
  {
    loanNumber: {
      type: String,
      required: [true, 'Loan number is required'],
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please add a company'],
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      required: [true, 'Please add a lender bank'],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    principalAmount: {
      type: Number,
      required: [true, 'Please add a principal amount'],
    },
    tenure: {
      type: Number,
      required: [true, 'Please add tenure in months'],
    },
    rateOfInterest: {
      type: Number,
      required: [true, 'Please add rate of interest'],
    },
    interestType: {
      type: String,
      default: 'Flat',
    },
    isInterestOrPrincipal: {
      type: Number,
      default: 1, // 1 = Principal + Interest, 2 = Only Interest
    },
    dateOfPayment: {
      type: Date,
      required: [true, 'Please add date of payment'],
    },
    balancePrincipal: {
      type: Number,
      default: function() {
        return this.principalAmount;
      },
    },
    balanceInterestTotal: {
      type: Number,
      default: 0,
    },
    totalInterest: {
      type: Number,
      default: 0,
    },
    loanType: {
      type: String,
      trim: true,
    },
    loanReason: {
      type: String,
      trim: true,
    },
    mortgageDetails: {
      type: String,
      trim: true,
    },
    guranterDetails: {
      type: String,
      trim: true,
    },
    isForeClosure: {
      type: Boolean,
      default: false,
    },
    foreClosureDate: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalBalanceAmount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Loan', LoanSchema);
