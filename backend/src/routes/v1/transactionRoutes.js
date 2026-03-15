const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/transactionController');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/self-transfer', protect, transactionController.createSelfTransfer);

module.exports = router;
