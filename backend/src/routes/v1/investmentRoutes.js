const express = require('express');
const {
  createInvestment,
  getInvestments,
  getInvestment,
  updateInvestment,
  deleteInvestment,
  forecloseInvestment,
  lumpsumInvestment,
  restructureInvestment,
  getInvestmentInstallments
} = require('../../controllers/investmentController');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const validateRequest = require('../../middlewares/validateRequest');
const { investmentSchema, updateInvestmentSchema } = require('../../validators/investmentValidator');

const router = express.Router();

router.use(protect); // All investment routes are protected

router.route('/')
  .post(authorize('maker', 'admin', 'super_admin'), validateRequest(investmentSchema), createInvestment)
  .get(getInvestments);

router.get('/installments', getInvestmentInstallments);

router.route('/:id')
  .get(getInvestment)
  .put(authorize('maker', 'admin', 'super_admin'), validateRequest(updateInvestmentSchema), updateInvestment)
  .delete(authorize('maker', 'admin', 'super_admin'), deleteInvestment);

router.post('/:id/foreclose', authorize('maker', 'admin', 'super_admin'), forecloseInvestment);
router.post('/:id/lumpsum', authorize('maker', 'admin', 'super_admin'), lumpsumInvestment);
router.post('/:id/restructure', authorize('maker', 'admin', 'super_admin'), restructureInvestment);


module.exports = router;
