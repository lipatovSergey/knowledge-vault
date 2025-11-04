import { WithId } from "../../types/mongo";
import { UserDocument, UserSchemaType } from "./user.model";

//type guard
function isUserDocument(value: unknown): value is UserDocument {
  return (
    value !== null &&
    typeof value === "object" &&
    "toObject" in value &&
    typeof (value as any).toObject === "function"
  );
}

export type UserDto = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPasswordDto = {
  id: string;
  password: string;
  email: string;
};

function toUserDto(rawUser: WithId<UserSchemaType> | UserDocument): UserDto {
  const source = isUserDocument(rawUser) ? rawUser.toObject() : rawUser;

  return {
    id: source._id.toString(),
    name: source.name,
    email: source.email,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toUserWithPasswordDto(
  rawUser: WithId<UserSchemaType> | UserDocument,
): UserWithPasswordDto {
  const source = isUserDocument(rawUser) ? rawUser.toObject() : rawUser;

  return {
    id: source._id.toString(),
    password: source.password,
    email: source.email,
  };
}

export { toUserDto, toUserWithPasswordDto };
