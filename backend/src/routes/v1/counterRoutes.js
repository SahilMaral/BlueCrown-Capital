const express = require('express');
const { getCounters, createCounter, updateCounter, deleteCounter } = require('../../controllers/counterController');
const { protect, authorize } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.route('/')
  .get(getCounters)
  .post(createCounter);

router.route('/:id')
  .put(updateCounter)
  .delete(deleteCounter);

module.exports = router;
