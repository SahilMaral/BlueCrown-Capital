const express = require('express');
const bankController = require('../../controllers/bankController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(bankController.getBanks)
  .post(authorize('maker', 'admin', 'super_admin'), bankController.createBank);

router
  .route('/:id')
  .get(bankController.getBankById)
  .put(authorize('maker', 'admin', 'super_admin'), bankController.updateBank)
  .delete(authorize('maker', 'admin', 'super_admin'), bankController.deleteBank);


module.exports = router;
