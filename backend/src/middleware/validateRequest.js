const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Place after an array of express-validator checks:
// router.post('/x', [body('email').isEmail()], validateRequest, handler)
function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(ApiError.badRequest('Validation failed', details));
  }
  next();
}

module.exports = validateRequest;
