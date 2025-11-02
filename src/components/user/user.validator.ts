import { z } from "zod";

const userSchemas = {
  // TODO: add passpoword verification
  userCreate: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),

  userInfoPatch: z.object({
    name: z.string().min(1, "Name is required"),
  }),
};

export type CreateUserDto = z.infer<typeof userSchemas.userCreate>;
export type UpdateUserDto = z.infer<typeof userSchemas.userInfoPatch>;
export type UserEmail = CreateUserDto["email"];

export default userSchemas;
