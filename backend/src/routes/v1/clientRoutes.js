const express = require('express');
const clientController = require('../../controllers/clientController');
const { protect } = require('../../middlewares/authMiddleware');
const clientUpload = require('../../middlewares/clientUploadMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(clientController.getClients)
  .post(clientUpload.array('documents', 10), clientController.createClient);

router
  .route('/:id')
  .get(clientController.getClientById)
  .put(clientUpload.array('documents', 10), clientController.updateClient)
  .delete(clientController.deleteClient);

router.delete('/:clientId/documents/:index', clientController.deleteDocument);

module.exports = router;
