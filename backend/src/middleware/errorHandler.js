function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    const field = issues[0]?.path?.slice(1).join('.');
    return res.status(400).json({
      error: true,
      message: issues[0]?.message || 'Validation error',
      field: field ? String(field) : undefined,
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: true, message: 'Invalid or expired token' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: true,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
