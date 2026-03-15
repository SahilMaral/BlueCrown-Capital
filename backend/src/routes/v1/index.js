const express = require('express');
const authRoutes = require('./authRoutes');
const investmentRoutes = require('./investmentRoutes');
const loanRoutes = require('./loanRoutes');
const ledgerRoutes = require('./ledgerRoutes');
const bankRoutes = require('./bankRoutes');
const companyRoutes = require('./companyRoutes');
const clientRoutes = require('./clientRoutes');
const receiptRoutes = require('./receiptRoutes');
const paymentRoutes = require('./paymentRoutes');
const transactionRoutes = require('./transactionRoutes');
const reportRoutes = require('./reportRoutes');

const counterRoutes = require('./counterRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/receipts', receiptRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/counters', counterRoutes);
router.use('/investments', investmentRoutes);
router.use('/loans', loanRoutes);
router.use('/ledgers', ledgerRoutes);
router.use('/banks', bankRoutes);
router.use('/companies', companyRoutes);
router.use('/clients', clientRoutes);
router.use('/payments', paymentRoutes);
router.use('/transactions', transactionRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
