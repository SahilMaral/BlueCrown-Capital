const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema(
  {
    investmentNumber: {
      type: String,
      required: [true, 'Investment number is required'],
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Please add a client'],
    },
    lenderCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please add a lender company'],
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
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
    totalInterest: {
      type: Number,
      default: 0,
    },
    isInterestOrPrincipal: {
      type: String,
      enum: ['Only interest', 'Principal + Interest'],
      required: [true, 'Please select a repayment schedule'],
    },
    dateOfPayment: {
      type: Date,
      required: [true, 'Please add date of payment'],
    },
    paymentType: {
      type: String,
      enum: ['Cash', 'Bank', 'Cheque', 'Online', 'Bank Transfer'],
    },
    emiAmount: {
      type: Number,
      default: 0,
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
    investmentType: {
      type: String,
      trim: true,
    },
    investmentReason: {
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
    officialAddress: {
      type: String,
      trim: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    restructureDate: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Investment', InvestmentSchema);
