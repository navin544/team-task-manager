const crypto = require('crypto');

const bcrypt = require('bcryptjs');

const env = require('../config/env');
const PasswordResetToken = require('../models/PasswordResetToken');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { serializeUser } = require('../utils/serializers');

const { logActivity } = require('./activityService');
const { sendEmail } = require('./emailService');
const {
  getExpirationDate,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('./tokenService');

function buildUserPayload(user) {
  return {
    sub: String(user.id || user._id),
    email: user.email,
    role: user.role
  };
}

async function issueSession(user) {
  const accessToken = signAccessToken(buildUserPayload(user));
  const refreshToken = signRefreshToken(buildUserPayload(user));

  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getExpirationDate(env.JWT_REFRESH_EXPIRES_IN)
  });

  return {
    accessToken,
    refreshToken,
    user: serializeUser(user)
  };
}

async function registerUser(payload) {
  const email = payload.email.toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const password = await bcrypt.hash(payload.password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name: payload.name,
    email,
    password,
    role: 'MEMBER',
    verificationToken
  });

  const verificationLink = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your Team Task Manager account',
      text: `Hi ${user.name},\n\nPlease verify your account using this link: ${verificationLink}`,
      html: `<h1>Account Verification</h1><p>Hi ${user.name},</p><p>Please click the button below to verify your account:</p><a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:white;text-decoration:none;border-radius:5px;">Verify Account</a>`
    });
  } catch (emailError) {
    console.warn('Verification email could not be sent:', emailError.message);
  }

  await logActivity({
    actorId: user.id,
    action: 'user.registered',
    entityType: 'AUTH',
    entityId: user.id,
    metadata: { email: user.email }
  });

  return issueSession(user);
}

async function verifyEmail(token) {
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();

  await logActivity({
    actorId: user.id,
    action: 'auth.email_verified',
    entityType: 'AUTH',
    entityId: user.id
  });
}

async function loginUser(payload) {
  const user = await User.findOne({
    email: payload.email.toLowerCase()
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  await logActivity({
    actorId: user.id,
    action: 'auth.logged_in',
    entityType: 'AUTH',
    entityId: user.id,
    metadata: { email: user.email }
  });

  return issueSession(user);
}

async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return;
  }

  await RefreshToken.updateMany(
    {
      tokenHash: hashToken(refreshToken)
    },
    {
      $set: {
        revokedAt: new Date()
      }
    }
  );
}

async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  const payload = verifyRefreshToken(refreshToken);
  const storedToken = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken)
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token is no longer valid');
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  storedToken.revokedAt = new Date();
  await storedToken.save();

  return issueSession(user);
}

async function forgotPassword(email) {
  const user = await User.findOne({
    email: email.toLowerCase()
  }).select('name email role avatar createdAt updatedAt');

  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);

  await PasswordResetToken.create({
    userId: user.id,
    tokenHash: hashedToken,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30)
  });

  const resetLink = `${env.RESET_PASSWORD_URL}?token=${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your Team Task Manager password',
    text: `Reset your password using this link: ${resetLink}`,
    html: `<p>Reset your Team Task Manager password using the link below:</p><p><a href="${resetLink}">${resetLink}</a></p>`
  });
}

async function resetPassword(payload) {
  const hashedToken = hashToken(payload.token);
  const resetToken = await PasswordResetToken.findOne({
    tokenHash: hashedToken
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new ApiError(400, 'Password reset token is invalid or expired');
  }

  const password = await bcrypt.hash(payload.password, 12);

  await User.findByIdAndUpdate(resetToken.userId, {
    password
  });
  resetToken.usedAt = new Date();
  await resetToken.save();
  await RefreshToken.deleteMany({
    userId: resetToken.userId
  });

  await logActivity({
    actorId: resetToken.userId,
    action: 'auth.password_reset',
    entityType: 'AUTH',
    entityId: String(resetToken.userId)
  });
}

module.exports = {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  resetPassword,
  verifyEmail
};
