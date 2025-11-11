import { Email, MongoId, PasswordPlain } from "../../types/primitives";

export type CreateUserInput = {
  name: string;
  email: Email;
  password: PasswordPlain;
};

export type UpdateUserInput = {
  userId: MongoId;
  name?: string;
};

export type AuthUserInput = {
  email: Email;
  password: PasswordPlain;
};

export type UserDomain = {
  id: MongoId;
  name: string;
  email: Email;
  createdAt: Date;
  updatedAt: Date;
};
