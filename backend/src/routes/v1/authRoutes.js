const express = require('express');
const { register, login, getMe, updateDetails, updatePassword, forgotPassword, resetPassword } = require('../../controllers/authController');
const upload = require('../../middlewares/uploadMiddleware');
const { protect } = require('../../middlewares/authMiddleware');
const validateRequest = require('../../middlewares/validateRequest');
const { registerSchema, loginSchema } = require('../../validators/authValidator');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, upload.single('photo'), updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
