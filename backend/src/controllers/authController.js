const env = require('../config/env');
const {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  resetPassword
} = require('../services/authService');
const { clearRefreshCookie, setRefreshCookie } = require('../services/tokenService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

const register = catchAsync(async (req, res) => {
  const session = await registerUser(req.validated.body);
  setRefreshCookie(res, session.refreshToken);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: {
      user: session.user,
      accessToken: session.accessToken
    }
  });
});

const login = catchAsync(async (req, res) => {
  const session = await loginUser(req.validated.body);
  setRefreshCookie(res, session.refreshToken);

  return sendSuccess(res, {
    message: 'Logged in successfully',
    data: {
      user: session.user,
      accessToken: session.accessToken
    }
  });
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
  await logoutUser(refreshToken);
  clearRefreshCookie(res);

  return sendSuccess(res, {
    message: 'Logged out successfully'
  });
});

const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
  const session = await refreshSession(refreshToken);
  setRefreshCookie(res, session.refreshToken);

  return sendSuccess(res, {
    message: 'Session refreshed',
    data: {
      user: session.user,
      accessToken: session.accessToken
    }
  });
});

const requestPasswordReset = catchAsync(async (req, res) => {
  await forgotPassword(req.validated.body.email);

  return sendSuccess(res, {
    message: 'If the email exists, a reset link has been sent'
  });
});

const confirmPasswordReset = catchAsync(async (req, res) => {
  await resetPassword(req.validated.body);

  return sendSuccess(res, {
    message: 'Password reset successful'
  });
});

module.exports = {
  confirmPasswordReset,
  login,
  logout,
  refresh,
  register,
  requestPasswordReset
};
