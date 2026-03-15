const express = require('express');
const companyController = require('../../controllers/companyController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(companyController.getCompanies)
  .post(companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompanyById)
  .put(companyController.updateCompany)
  .delete(companyController.deleteCompany);

module.exports = router;
