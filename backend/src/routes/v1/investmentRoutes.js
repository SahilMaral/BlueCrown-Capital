const express = require('express');
const {
  createInvestment,
  getInvestments,
  getInvestment,
  updateInvestment,
  deleteInvestment,
  forecloseInvestment,
  lumpsumInvestment,
} = require('../../controllers/investmentController');
const { protect } = require('../../middlewares/authMiddleware');
const validateRequest = require('../../middlewares/validateRequest');
const { investmentSchema, updateInvestmentSchema } = require('../../validators/investmentValidator');

const router = express.Router();

router.use(protect); // All investment routes are protected

router.route('/')
  .post(validateRequest(investmentSchema), createInvestment)
  .get(getInvestments);

router.route('/:id')
  .get(getInvestment)
  .put(validateRequest(updateInvestmentSchema), updateInvestment)
  .delete(deleteInvestment);

router.post('/:id/foreclose', forecloseInvestment);
router.post('/:id/lumpsum', lumpsumInvestment);

module.exports = router;
