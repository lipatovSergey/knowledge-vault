import { type UserDocument, UserModel } from "./user.model";
import type { Email, MongoId } from "../../types/primitives";
import { CreateUserInput, UpdateUserInput, UserDomain } from "./user.types";
import { mapPersistUserToDomain } from "./user.mapper";

// methods of user
const userRepo = {
  // saves new user to MongoDB and return it
  async create(createUserInput: CreateUserInput): Promise<UserDocument> {
    const newUser = new UserModel(createUserInput);
    return newUser.save();
  },

  // find user by email for login user
  // Warning! Use carefully returns user document with password
  async findByEmail(email: Email): Promise<UserDomain | null> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? mapPersistUserToDomain(user) : null;
  },

  // find user by ID
  async findById(id: MongoId): Promise<UserDomain | null> {
    const user = await UserModel.findById(id).lean();
    return user ? mapPersistUserToDomain(user) : null;
  },

  // delete user
  async deleteUser(id: MongoId): Promise<boolean> {
    const { deletedCount } = await UserModel.deleteOne({ _id: id });
    return deletedCount === 1;
  },

  // update user name by id
  async updateUserData(UpdateUserInput: UpdateUserInput): Promise<UserDomain | null> {
    const { userId, ...fieldsToUpdate } = UpdateUserInput;
    const user = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: fieldsToUpdate },
      {
        returnDocument: "after",
        runValidators: true,
        context: "query",
      },
    ).lean();
    return user ? mapPersistUserToDomain(user) : null;
  },

  // update user password by id
  async updatePassword(id: MongoId, hashedPassword: string): Promise<boolean> {
    const { matchedCount } = await UserModel.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } },
    );
    return matchedCount === 1;
  },
};

export type UserRepo = typeof userRepo;
export default userRepo;
