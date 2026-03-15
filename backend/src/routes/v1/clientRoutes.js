const express = require('express');
const clientController = require('../../controllers/clientController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(clientController.getClients)
  .post(clientController.createClient);

router
  .route('/:id')
  .get(clientController.getClientById)
  .put(clientController.updateClient)
  .delete(clientController.deleteClient);

module.exports = router;
