import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Missing bearer token',
        status: 401
      }
    });
  }

  try {
    const token = authHeader.slice('Bearer '.length);
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        status: 401
      }
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : [req.user?.role].filter(Boolean);

    if (!roles.some((role) => userRoles.includes(role))) {
      return res.status(403).json({
        error: {
          message: 'Forbidden',
          status: 403
        }
      });
    }

    return next();
  };
}
