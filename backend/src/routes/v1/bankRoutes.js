const express = require('express');
const bankController = require('../../controllers/bankController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(bankController.getBanks)
  .post(bankController.createBank);

router
  .route('/:id')
  .get(bankController.getBankById)
  .put(bankController.updateBank)
  .delete(bankController.deleteBank);

module.exports = router;
