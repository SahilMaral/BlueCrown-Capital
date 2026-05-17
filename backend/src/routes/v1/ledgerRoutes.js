const express = require('express');
const ledgerController = require('../../controllers/ledgerController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(ledgerController.getLedgers)
  .post(authorize('maker', 'admin', 'super_admin'), ledgerController.createLedger);

router
  .route('/:id')
  .get(ledgerController.getLedgerById)
  .put(authorize('maker', 'admin', 'super_admin'), ledgerController.updateLedger)
  .delete(authorize('maker', 'admin', 'super_admin'), ledgerController.deleteLedger);


module.exports = router;
