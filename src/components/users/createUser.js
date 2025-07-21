// use-case: create new user

module.exports = async function createUser(userData, userRepo) {
	// simple validation
	// TODO: move to validator
	if (!userData.name || !userData.email || !userData.password) {
		throw new Error("Name, password, email is required");
	}

	// here is buisness logic

	const newUser = await userRepo.create(userData);

	return newUser;
};
