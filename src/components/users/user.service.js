const {
	ConflictError,
	UnauthorizedError,
	NotFoundError,
	BadRequestError,
} = require("../../errors/errors.class");

function createUserService({ userRepo, bcrypt }) {
	return {
		// use-case: create new user
		async createUser(userData) {
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
		},

		// use-case: find user by email
		// TODO: create mapper for user
		async findUserByEmail(email) {
			const user = await userRepo.findByEmail(email);
			if (!user) {
				throw new UnauthorizedError("Invalid email or password");
			}
			return user;
		},

		// use-case: find user by ID
		async findUserById(id) {
			const user = await userRepo.findById(id);
			if (!user) {
				throw new NotFoundError("User not found");
			}
			return user;
		},

		// use-case: check user's password
		async checkUserPassword(plainPassword, hashedPassword) {
			const match = await bcrypt.compare(plainPassword, hashedPassword);
			if (!match) {
				throw new UnauthorizedError("Invalid email or password");
			}
		},

		// use-case: delete user by id
		async deleteUser(id) {
			const deleted = await userRepo.deleteUser(id);
			if (!deleted) {
				throw new NotFoundError("User not found");
			}
		},

		// use-case: update user's name
		async updateUserName(id, name) {
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
		},

		// use-case: update user's password
		async updateUserPassword(id, password) {
			const saltRounds = 10;
			const hashedPassword = await bcrypt.hash(password, saltRounds);
			const answer = await userRepo.updatePassword(id, hashedPassword);
			if (!answer) {
				throw new NotFoundError("User not found");
			}
		},
	};
}

module.exports = { createUserService };
