function errorMiddleware(error, _req, res) {
  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((issue) => issue.message)
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier'
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A unique field already exists'
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (statusCode === 500) {
    console.error('Unhandled Error:', error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    details: error.details || null
  });
}

module.exports = errorMiddleware;
