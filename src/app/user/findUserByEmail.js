// use-case: find user by email

module.exports = async function findUserByEmail(email, userRepo) {
	// TODO: move to validator
	if (!email) {
		throw new Error("email is required");
	}

	const user = await userRepo.findByEmail(email);

	return user;
};
