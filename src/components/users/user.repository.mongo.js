const UserModel = require("./User.js");

// methods of user
const userRepo = {
	// saves new user to MongoDB and return it
	async create(userData) {
		const newUser = new UserModel(userData);
		return await newUser.save();
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
