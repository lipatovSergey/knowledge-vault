const { ConflictError } = require("../errors/errors.class.js");

function requireGuest(req, _res, next) {
  if (req.session.userId) {
    throw new ConflictError();
  }
  next();
}

module.exports = requireGuest;
