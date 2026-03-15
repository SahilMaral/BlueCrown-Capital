const express = require('express');
const { getCounters, createCounter, updateCounter, deleteCounter } = require('../../controllers/counterController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCounters)
  .post(createCounter);

router.route('/:id')
  .put(updateCounter)
  .delete(deleteCounter);

module.exports = router;
