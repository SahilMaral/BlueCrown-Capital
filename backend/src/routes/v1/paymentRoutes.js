const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/transactionController');
const validateRequest = require('../../middlewares/validateRequest');
const { paymentSchema, updatePaymentSchema } = require('../../validators/paymentValidator');
const { protect } = require('../../middlewares/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(transactionController.getPayments)
  .post(validateRequest(paymentSchema), transactionController.createPayment);

router.post('/check-balance', transactionController.checkBalance);

router
  .route('/:id')
  .get(transactionController.getPaymentById)
  .patch(validateRequest(updatePaymentSchema), transactionController.updatePayment)
  .post(transactionController.cancelPayment);

router.post('/:id/cancel', transactionController.cancelPayment);
router.post('/:id/send-email', transactionController.sendPaymentEmail);

module.exports = router;
