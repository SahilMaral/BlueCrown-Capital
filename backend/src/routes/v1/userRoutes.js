const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, toggleUserBlock } = require('../../controllers/userController');
const { protect } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(upload.single('photo'), createUser);

router.route('/:id')
  .put(upload.single('photo'), updateUser)
  .delete(deleteUser);

router.patch('/:id/toggle-block', toggleUserBlock);

module.exports = router;
