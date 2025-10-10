const { userService } = require("./index.js");
const destroySession = require("../../utils/destroy-session.util.js");

const userController = {
	async createUser(req, res, next) {
		try {
			const userData = {
				name: req.validatedBody.name,
				email: req.validatedBody.email,
				password: req.validatedBody.password,
			};

			await userService.createUser(userData);
			res.status(201).json({ message: "User created successfully" });
		} catch (error) {
			next(error);
		}
	},

	async getUserInfo(req, res, next) {
		try {
			const user = await userService.findUserById(req.session.userId);

			const { _id, name, email } = user;
			const info = { _id, name, email };
			res.status(200).json(info);
		} catch (error) {
			next(error);
		}
	},

	async deleteUser(req, res, next) {
		try {
			await userService.deleteUser(req.session.userId);
			await destroySession(req);
			res.clearCookie("connect.sid");
			return res.status(200).json({ message: "User deleted" });
		} catch (error) {
			next(error);
		}
	},

	async updateUserName(req, res, next) {
		try {
			const newName = req.validatedBody.name;
			const updatedName = await userService.updateUserName(
				req.session.userId,
				newName
			);
			res.status(200).json({ updatedName: updatedName });
		} catch (error) {
			next(error);
		}
	},
};

module.exports = userController;
