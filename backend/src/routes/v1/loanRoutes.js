const express = require('express');
const {
  createLoan,
  getLoans,
  getLoan,
  updateLoan,
  deleteLoan,
  forecloseLoan,
  lumpsumLoan,
  getReminders,
} = require('../../controllers/loanController');
const { protect } = require('../../middlewares/authMiddleware');
const validateRequest = require('../../middlewares/validateRequest');
const { loanSchema, updateLoanSchema } = require('../../validators/loanValidator');

const router = express.Router();

router.use(protect); // All loan routes are protected

router.get('/reminders', getReminders);

router.route('/')
  .post(validateRequest(loanSchema), createLoan)
  .get(getLoans);

router.route('/:id')
  .get(getLoan)
  .put(validateRequest(updateLoanSchema), updateLoan)
  .delete(deleteLoan);

router.post('/:id/foreclose', forecloseLoan);
router.post('/:id/lumpsum', lumpsumLoan);

module.exports = router;
