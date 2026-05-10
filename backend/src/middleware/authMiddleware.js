const User = require('../models/User');
const { verifyAccessToken } = require('../services/tokenService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { serializeUser } = require('../utils/serializers');


const authMiddleware = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = header.replace('Bearer ', '');
  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).select(
    'name email role avatar createdAt updatedAt'
  );

  if (!user) {
    throw new ApiError(401, 'Session is invalid');
  }

  req.user = serializeUser(user);
  req.token = token;
  next();
});

module.exports = authMiddleware;
