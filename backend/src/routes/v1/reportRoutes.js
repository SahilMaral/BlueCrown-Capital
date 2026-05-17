const express = require('express');
const reportController = require('../../controllers/reportController');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect);

router.get('/day', authorize('maker', 'admin', 'super_admin'), reportController.getDayReport);
router.get('/ledger', reportController.getLedgerReport);
router.get('/cancel-receipt', authorize('maker', 'admin', 'super_admin'), reportController.getCancelReceiptReport);
router.get('/cancel-payment', authorize('maker', 'admin', 'super_admin'), reportController.getCancelPaymentReport);
router.get('/admin-charges', authorize('maker', 'admin', 'super_admin'), reportController.getAdminChargesReport);
router.get('/penalty-charges', authorize('maker', 'admin', 'super_admin'), reportController.getPenaltyChargesReport);
router.get('/investment-report', reportController.getInvestmentReport);
router.get('/dashboard-stats', reportController.getDashboardStats);
router.get('/transaction-history', reportController.getTransactionHistory);
router.get('/self-transfer-data', authorize('maker', 'admin', 'super_admin'), reportController.getSelfTransferData);

router.post('/email', upload.single('reportAttachment'), reportController.sendReportEmail);


module.exports = router;
