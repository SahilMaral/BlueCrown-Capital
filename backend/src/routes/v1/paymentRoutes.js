const express = require('express');
const transactionController = require('../../controllers/transactionController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(transactionController.getPayments)
  .post(transactionController.createPayment);

router
  .route('/:id')
  .get(transactionController.getPaymentById);

module.exports = router;
