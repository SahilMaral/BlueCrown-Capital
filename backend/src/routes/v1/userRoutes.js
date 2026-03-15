const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, toggleUserBlock } = require('../../controllers/userController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

router.patch('/:id/toggle-block', toggleUserBlock);

module.exports = router;
