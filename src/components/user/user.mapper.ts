import { WithId } from "../../types/primitives";
import { UserDocument, UserSchemaType } from "./user.model";
import { UserProfileResponse } from "../../contracts/user/me.contract";
import { UserDomain } from "./user.types";

//type guard
function isUserDocument(value: unknown): value is UserDocument {
  return (
    value !== null &&
    typeof value === "object" &&
    "toObject" in value &&
    typeof (value as any).toObject === "function"
  );
}

function userToObject(rawUser: WithId<UserSchemaType> | UserDocument) {
  return isUserDocument(rawUser) ? rawUser.toObject() : rawUser;
}

export type UserWithPasswordDto = {
  id: string;
  password: string;
  email: string;
};

export function mapPersistUserToDomain(rawUser: WithId<UserSchemaType> | UserDocument): UserDomain {
  const userObject = userToObject(rawUser);

  return {
    id: userObject._id.toString(),
    name: userObject.name,
    email: userObject.email,
    createdAt: new Date(userObject.createdAt),
    updatedAt: new Date(userObject.updatedAt),
  };
}

export function mapDomainUserToContract(user: UserDomain): UserProfileResponse {
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
