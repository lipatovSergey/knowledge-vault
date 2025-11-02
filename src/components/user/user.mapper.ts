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

function toUserDto(rawUser: WithId<UserSchemaType> | UserDocument) {
  const source = isUserDocument(rawUser) ? rawUser.toObject() : rawUser;

  return {
    id: source._id.toString(),
    name: source.name,
    email: source.email,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

export default toUserDto;
