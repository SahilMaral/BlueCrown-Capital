const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, toggleUserBlock } = require('../../controllers/userController');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.route('/')
  .get(getUsers)
  .post(upload.single('photo'), createUser);

router.route('/:id')
  .put(upload.single('photo'), updateUser)
  .delete(deleteUser);

router.patch('/:id/toggle-block', toggleUserBlock);

module.exports = router;
