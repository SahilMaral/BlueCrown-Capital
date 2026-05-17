const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/transactionController');
const validateRequest = require('../../middlewares/validateRequest');
const { paymentSchema, updatePaymentSchema } = require('../../validators/paymentValidator');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(transactionController.getPayments)
  .post(authorize('maker', 'admin', 'super_admin'), validateRequest(paymentSchema), transactionController.createPayment);

router.post('/check-balance', authorize('maker', 'admin', 'super_admin'), transactionController.checkBalance);

router
  .route('/:id')
  .get(transactionController.getPaymentById)
  .patch(authorize('admin', 'super_admin'), validateRequest(updatePaymentSchema), transactionController.updatePayment)
  .post(authorize('admin', 'super_admin'), transactionController.cancelPayment);

router.post('/:id/cancel', authorize('admin', 'super_admin'), transactionController.cancelPayment);
router.post('/:id/send-email', transactionController.sendPaymentEmail);


module.exports = router;
