import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

export type UserSchemaType = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserSchemaType>;
export const UserModel = model<UserSchemaType>("User", userSchema);
export { userSchema };
