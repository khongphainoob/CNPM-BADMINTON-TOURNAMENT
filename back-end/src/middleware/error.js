export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  res.status(status).json({
    error: {
      message: error.message || 'Internal server error',
      status
    }
  });
}
