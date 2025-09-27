const bcrypt = require("bcrypt");
const {
	ConflictError,
	UnauthorizedError,
	NotFoundError,
} = require("../../errors/errors.class");

// use-case: create new user
async function createUser(userData, userRepo) {
	// hashing pass with bcrypt
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

	const userToSave = {
		...userData,
		password: hashedPassword,
	};
	try {
		const result = await userRepo.create(userToSave);
		return result;
	} catch (err) {
		if (
			err?.code === 11000 &&
			(err?.keyPattern?.email || err?.keyValue?.email)
		) {
			throw new ConflictError("User already exists");
		}
		throw err;
	}
}

// use-case: find user by email
async function findUserByEmail(email, userRepo) {
	const user = await userRepo.findByEmail(email);
	if (!user) {
		throw new UnauthorizedError("Invalid email or password");
	}
	return user;
}

// use-case: find user by ID
async function findUserById(id, userRepo) {
	const user = await userRepo.findById(id);
	if (!user) {
		throw new NotFoundError("User not found");
	}
	return user;
}

// use-case: check user's password
async function checkUserPassword(plainPassword, hashedPassword) {
	const match = await bcrypt.compare(plainPassword, hashedPassword);
	if (!match) {
		throw new UnauthorizedError("Invalid email or password");
	}
}

// use-case: delete user by id
async function deleteUser(id, userRepo) {
	const deleted = await userRepo.deleteUser(id);
	if (!deleted) {
		throw new NotFoundError("User not found");
	}
}

// use-case: update user's name
async function updateUserName(id, name, userRepo) {
	try {
		const updatedUser = await userRepo.updateUserName(id, name);
		if (!updatedUser) {
			throw new NotFoundError("User not found");
		}
		return updatedUser.name;
	} catch (error) {
		if (error.name === "ValidationError") {
			throw new BadRequestError(error.message);
		}
		throw error;
	}
}

// use-case: update user's password
async function updateUserPassword(email, password, userRepo) {
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	const answer = await userRepo.updatePassword(email, hashedPassword);
	if (!answer) {
		throw new NotFoundError("User not found");
	}
}

module.exports = {
	createUser,
	findUserByEmail,
	checkUserPassword,
	findUserById,
	deleteUser,
	updateUserName,
	updateUserPassword,
};
