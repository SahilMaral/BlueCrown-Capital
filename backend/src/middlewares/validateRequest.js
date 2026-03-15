const ApiError = require('../utils/ApiError');

const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true, // Remove undefined keys
    });

    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(new ApiError(400, `Validation Error: ${errorMessage}`));
    }

    // Replace req.body with validated values (which strips unknowns and applies defaults)
    req[source] = value;
    next();
  };
};

module.exports = validateRequest;
