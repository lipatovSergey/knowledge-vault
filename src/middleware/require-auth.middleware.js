const { UnauthorizedError } = require("../errors/errors.class.js");

function requireAuth(req, _res, next) {
  if (!req.session.userId) {
    throw new UnauthorizedError();
  }
  next();
}

module.exports = requireAuth;
