const userServices = require("./userServices");
const userRepo = require("./user.repository.mongo");

const userController = {
	async createUser(req, res, next) {
		try {
			const userData = {
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
			};

			await userServices.createUser(userData, userRepo);
			res.status(201).json({ message: "User created successfully" });
		} catch (error) {
			next(error);
		}
	},
};

module.exports = userController;
