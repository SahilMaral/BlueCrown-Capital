const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/transactionController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.post('/self-transfer', protect, authorize('maker', 'admin', 'super_admin'), transactionController.createSelfTransfer);

module.exports = router;
