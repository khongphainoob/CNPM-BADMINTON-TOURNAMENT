export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          status: 400,
          details: result.error.flatten()
        }
      });
    }

    req.body = result.data;
    return next();
  };
}
