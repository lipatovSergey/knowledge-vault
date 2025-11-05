import {
  type UserDocument,
  type UserSchemaType,
  UserModel,
} from "./user.model";
import type { CreateUserDto, UpdateUserDto, UserEmail } from "./user.validator";
import type { WithId, MongoId } from "../../types/mongo";

// methods of user
const userRepo = {
  // saves new user to MongoDB and return it
  async create(userData: CreateUserDto): Promise<UserDocument> {
    const newUser = new UserModel(userData);
    return newUser.save();
  },

  // find user by email for login user
  // Warning! Use carefully returns user document with password
  async findByEmail(email: UserEmail): Promise<WithId<UserSchemaType> | null> {
    const user = await UserModel.findOne({ email }).select("+password").lean();
    return user;
  },

  // find user by ID
  async findById(id: MongoId): Promise<WithId<UserSchemaType> | null> {
    const user = await UserModel.findById(id).lean();
    return user;
  },

  // delete user
  async deleteUser(id: MongoId): Promise<boolean> {
    const { deletedCount } = await UserModel.deleteOne({ _id: id });
    return deletedCount === 1;
  },

  // update user name by id
  async updateUserData(
    id: MongoId,
    data: UpdateUserDto,
  ): Promise<WithId<UserSchemaType> | null> {
    const result = await UserModel.findOneAndUpdate({ _id: id }, data, {
      returnDocument: "after",
      runValidators: true,
      context: "query",
    }).lean();
    return result;
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
