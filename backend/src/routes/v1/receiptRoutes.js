const express = require('express');
const transactionController = require('../../controllers/transactionController');
const { protect } = require('../../middlewares/authMiddleware');
const validateRequest = require('../../middlewares/validateRequest');
const { receiptSchema, updateReceiptSchema } = require('../../validators/receiptValidator');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect);

router.get('/', transactionController.getReceipts);
router.post('/', validateRequest(receiptSchema), transactionController.createReceipt);

router.post('/:id/send-email', upload.single('pdfAttachment'), transactionController.sendReceiptEmail);

router.get('/:id', transactionController.getReceiptById);
router.put('/:id', validateRequest(updateReceiptSchema), transactionController.updateReceipt);
router.post('/:id/cancel', transactionController.cancelReceipt);

module.exports = router;
