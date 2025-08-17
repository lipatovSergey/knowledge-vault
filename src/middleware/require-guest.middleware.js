function requireGuest(req, res, next) {
  if (req.session.userId) {
    return res.status(409).json({ message: "User already logged in" });
  }
  next();
}

module.exports = requireGuest;
