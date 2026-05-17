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
  restructureLoan,
  updateReminder
} = require('../../controllers/loanController');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const validateRequest = require('../../middlewares/validateRequest');
const { loanSchema, updateLoanSchema } = require('../../validators/loanValidator');

const router = express.Router();

router.use(protect); // All loan routes are protected

router.get('/reminders', getReminders);

router.route('/')
  .post(authorize('maker', 'admin', 'super_admin'), validateRequest(loanSchema), createLoan)
  .get(getLoans);

router.route('/:id')
  .get(getLoan)
  .put(authorize('maker', 'admin', 'super_admin'), validateRequest(updateLoanSchema), updateLoan)
  .delete(authorize('maker', 'admin', 'super_admin'), deleteLoan);

router.post('/:id/foreclose', authorize('maker', 'admin', 'super_admin'), forecloseLoan);
router.post('/:id/lumpsum', authorize('maker', 'admin', 'super_admin'), lumpsumLoan);
router.post('/:id/restructure', authorize('maker', 'admin', 'super_admin'), restructureLoan);
router.put('/reminders/:reminderId', authorize('maker', 'admin', 'super_admin'), updateReminder);


module.exports = router;
