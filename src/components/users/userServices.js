const bcrypt = require("bcrypt");

// use-case: create new user
async function createUser(userData, userRepo) {
	// simple validation
	// TODO: move to validator
	if (!userData.name || !userData.email || !userData.password) {
		throw new Error("Name, password, email is required");
	}

	// hashing pass with bcrypt
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

	const userToSave = {
		...userData,
		password: hashedPassword,
	};

	// here is buisness logic

	const result = await userRepo.create(userToSave);

	if (result === "USER_EXISTS") {
		return "USER_EXISTS";
	}

	return result;
}

// use-case: find user by email
async function findUserByEmail(email, userRepo) {
	// TODO: move to validator
	if (!email) {
		throw new Error("email is required");
	}

	const user = await userRepo.findByEmail(email);
	return user;
}

// use-case: check user's password
async function checkUserPassword(plainPassword, hashedPassword) {
	return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
	createUser,
	findUserByEmail,
	checkUserPassword,
};
