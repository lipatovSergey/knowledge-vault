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
				return res.status(200).json({ message: "Login successful" });
			}
		} catch (error) {
			next(error);
		}
	},

	async logoutUser(req, res, next) {
		try {
			req.session.destroy(() => {
				res.clearCookie("connect.sid");
				res.status(200).json({ message: "Logged out" });
			});
		} catch (error) {
			next(error);
		}
	},

	async getUserInfo(req, res, next) {
		try {
			const user = await userRepo.findById(req.session.userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			const { _id, name, email } = user;
			const info = { _id, name, email };
			res.json(info);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = userController;
