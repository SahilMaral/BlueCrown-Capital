const express = require('express');
const reportController = require('../../controllers/reportController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/day', reportController.getDayReport);
router.get('/ledger', reportController.getLedgerReport);
router.get('/cancel-receipt', reportController.getCancelReceiptReport);
router.get('/cancel-payment', reportController.getCancelPaymentReport);
router.get('/admin-charges', reportController.getAdminChargesReport);
router.get('/penalty-charges', reportController.getPenaltyChargesReport);
router.get('/investment-report', reportController.getInvestmentReport);
router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/transaction-history', reportController.getTransactionHistory);
router.get('/self-transfer-data', reportController.getSelfTransferData);

module.exports = router;
