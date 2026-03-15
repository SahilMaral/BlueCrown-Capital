const express = require('express');
const ledgerController = require('../../controllers/ledgerController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(ledgerController.getLedgers)
  .post(ledgerController.createLedger);

router
  .route('/:id')
  .get(ledgerController.getLedgerById)
  .put(ledgerController.updateLedger)
  .delete(ledgerController.deleteLedger);

module.exports = router;
