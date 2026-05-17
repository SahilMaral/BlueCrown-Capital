const express = require('express');
const companyController = require('../../controllers/companyController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(companyController.getCompanies)
  .post(authorize('maker', 'admin', 'super_admin'), companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompanyById)
  .put(authorize('maker', 'admin', 'super_admin'), companyController.updateCompany)
  .delete(authorize('maker', 'admin', 'super_admin'), companyController.deleteCompany);


module.exports = router;
