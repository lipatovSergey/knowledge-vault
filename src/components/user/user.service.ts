import { ConflictError, UnauthorizedError, NotFoundError } from "../../errors/errors.class";
import type { MongoId, Email } from "../../types/primitives";
import type { UserRepo } from "./user.repository.mongo";
import type { UpdateUserInput, UserDomain } from "./user.types";
import type * as bcryptType from "bcrypt";
import type { CreateUserInput } from "./user.types";
import { MongoServerError } from "mongodb";

function createUserService({
  userRepo,
  bcrypt,
}: {
  userRepo: UserRepo;
  bcrypt: typeof bcryptType;
}) {
  return {
    // use-case: create new user
    async createUser(createUserInput: CreateUserInput): Promise<void> {
      // hashing pass with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createUserInput.password, saltRounds);

      const userToSave = {
        ...createUserInput,
        password: hashedPassword,
      };
      try {
        await userRepo.create(userToSave);
      } catch (error) {
        if (
          error instanceof MongoServerError &&
          error?.code === 11000 &&
          (error?.keyPattern?.email || error?.keyValue?.email)
        ) {
          throw new ConflictError("User already exists");
        }
        throw error;
      }
    },

    // use-case: find user by email
    async findUserByEmail(email: Email): Promise<UserDomain> {
      const user = await userRepo.findByEmail(email);
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }
      return user;
    },

    // use-case: find user by ID
    async findUserById(id: MongoId): Promise<UserDomain> {
      const user = await userRepo.findById(id);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    },

    // use-case: check user's password
    async checkUserPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
      const match = await bcrypt.compare(plainPassword, hashedPassword);
      if (!match) {
        throw new UnauthorizedError("Invalid email or password");
      }
      return match;
    },

    // use-case: delete user by id
    async deleteUser(id: MongoId): Promise<boolean> {
      const deleted = await userRepo.deleteUser(id);
      if (!deleted) {
        throw new NotFoundError("User not found");
      }
      return deleted;
    },

    // use-case: update user's data
    async updateUserData(updateUserInput: UpdateUserInput): Promise<UserDomain> {
      const updatedUser = await userRepo.updateUserData(updateUserInput);
      if (!updatedUser) {
        throw new NotFoundError("User not found");
      }
      return updatedUser;
    },

    // use-case: update user's password
    async updateUserPassword(id: MongoId, password: string): Promise<boolean> {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const result = await userRepo.updatePassword(id, hashedPassword);
      if (!result) {
        throw new NotFoundError("User not found");
      }
      return result;
    },
  };
}

export default createUserService;
