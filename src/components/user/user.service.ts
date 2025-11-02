import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../../errors/errors.class";
import toUserDto from "./user.mapper";
import type { MongoId } from "../../types/mongo";
import type { UserRepo } from "./user.repository.mongo";
import type { UserDto } from "./user.types";
import type { CreateUserDto, UpdateUserDto, UserEmail } from "./user.validator";
import type * as bcryptType from "bcrypt";
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
    async createUser(userData: CreateUserDto): Promise<UserDto> {
      // hashing pass with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const userToSave = {
        ...userData,
        password: hashedPassword,
      };
      try {
        const user = await userRepo.create(userToSave);
        return toUserDto(user);
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
    async findUserByEmail(email: UserEmail): Promise<UserDto> {
      const user = await userRepo.findByEmail(email);
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }
      return toUserDto(user);
    },

    // use-case: find user by ID
    async findUserById(id: MongoId): Promise<UserDto> {
      const user = await userRepo.findById(id);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return toUserDto(user);
    },

    // use-case: check user's password
    async checkUserPassword(
      plainPassword: string,
      hashedPassword: string,
    ): Promise<boolean> {
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
    async updateUserData(id: MongoId, data: UpdateUserDto): Promise<UserDto> {
      const updatedUser = await userRepo.updateUserData(id, data);
      if (!updatedUser) {
        throw new NotFoundError("User not found");
      }
      return toUserDto(updatedUser);
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
