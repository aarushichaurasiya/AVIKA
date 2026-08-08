// Removes repetitive try/catch from every controller. Any rejected promise
// or thrown error inside `fn` is forwarded to Express's error middleware.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
