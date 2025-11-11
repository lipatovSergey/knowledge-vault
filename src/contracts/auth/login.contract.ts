import z from "zod";
import { emailSchema, passwordPlainSchema } from "../../types/primitives";
import { userProfileResponseSchema } from "../user/me.contract";

export const authLoginRequestSchema = z.object({
  email: emailSchema,
  password: passwordPlainSchema,
});
export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>;

export const authLoginResponseSchema = userProfileResponseSchema;
export type AuthLoginResponse = z.infer<typeof authLoginResponseSchema>;
