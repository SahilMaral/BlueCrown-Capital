const express = require('express');
const clientController = require('../../controllers/clientController');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const clientUpload = require('../../middlewares/clientUploadMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(clientController.getClients)
  .post(authorize('maker', 'admin', 'super_admin'), clientUpload.array('documents', 10), clientController.createClient);

router
  .route('/:id')
  .get(clientController.getClientById)
  .put(authorize('maker', 'admin', 'super_admin'), clientUpload.array('documents', 10), clientController.updateClient)
  .delete(authorize('maker', 'admin', 'super_admin'), clientController.deleteClient);

router.delete('/:clientId/documents/:index', authorize('maker', 'admin', 'super_admin'), clientController.deleteDocument);


module.exports = router;
