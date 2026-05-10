const express = require('express');

const {
  confirmPasswordReset,
  login,
  logout,
  refresh,
  register,
  requestPasswordReset,
  verifyEmailAccount
} = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), requestPasswordReset);
router.post('/reset-password', validateRequest(resetPasswordSchema), confirmPasswordReset);
router.get('/verify-email', verifyEmailAccount);

module.exports = router;
