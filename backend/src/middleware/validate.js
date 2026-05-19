function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validated = parsed;
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        const field = issues[0]?.path?.slice(1).join('.');
        return res.status(400).json({
          error: true,
          message: issues[0]?.message || 'Validation error',
          field: field ? String(field) : undefined,
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };
