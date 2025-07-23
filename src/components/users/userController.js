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

			const user = await userServices.createUser(userData, userRepo);
			if (user === "USER_EXISTS") {
				return res.status(409).json({ message: "User already exists" });
			}
			res.status(201).json({ message: "User created successfully" });
		} catch (error) {
			next(error);
		}
	},

	async loginUser(req, res, next) {
		try {
			const data = {
				email: req.body.email,
				password: req.body.password,
			};

			const user = await userServices.findUserByEmail(data.email, userRepo);
			const match = await userServices.checkUserPassword(
				data.password,
				user.password
			);

			if (!user || !match) {
				return res.status(401).json({ message: "Invalid email or password" });
			} else {
				req.session.userId = user._id;
				return res.status(200).json({ message: "Login successful", user });
			}
		} catch (error) {
			next(error);
		}
	},
};

module.exports = userController;
