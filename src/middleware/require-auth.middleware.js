function requireAuth(req, res, next) {
	console.log(req.session);
	if (!req.session.userId) {
		return res.status(401).json({ message: "Anauthorized" });
	}
	next();
}

module.exports = requireAuth;
