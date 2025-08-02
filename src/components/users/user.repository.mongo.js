const UserModel = require("./user.model.js");

// methods of user
const userRepo = {
	// saves new user to MongoDB and return it
	async create(userData) {
		try {
			const newUser = new UserModel(userData);
			return await newUser.save();
		} catch (error) {
			// user with passed email exists in DB
			if (error.code === 11000 && error.keyPattern?.email) {
				return "USER_EXISTS";
			}
			throw new Error(error);
		}
	},

	// find user by email
	async findByEmail(email) {
		const user = await UserModel.findOne({ email });
		return user;
	},

	// find user by ID
	async findById(id) {
		const user = await UserModel.findById(id);
		return user;
	},
};

module.exports = userRepo;
