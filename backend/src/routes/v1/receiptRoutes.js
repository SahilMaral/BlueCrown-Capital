const express = require('express');
const transactionController = require('../../controllers/transactionController');
const { protect } = require('../../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect);

router.get('/', transactionController.getReceipts);
router.post('/', transactionController.createReceipt);

router.post('/:id/send-email', upload.single('pdfAttachment'), transactionController.sendReceiptEmail);

router.get('/:id', transactionController.getReceiptById);
router.put('/:id', transactionController.updateReceipt);
router.delete('/:id', transactionController.deleteReceipt);

module.exports = router;
