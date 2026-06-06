/**
 * Application-level error class with status code and error code.
 */
export class AppError extends Error {
  constructor(status, message, code = 'ERROR', details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(req, res, _next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';

  if (status >= 500) {
    console.error('[ERROR]', error);
  }

  res.status(status).json({
    error: {
      code,
      message: error.message || 'Internal server error',
      ...(error.details ? { details: error.details } : {})
    }
  });
}
