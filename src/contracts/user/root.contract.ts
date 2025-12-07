import z from "zod";
import { emailSchema, passwordPlainSchema } from "../../types/primitives";

export const userRootPostRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  password: passwordPlainSchema,
});
export type UserRootPostRequest = z.infer<typeof userRootPostRequestSchema>;

export const userRootPostResponseSchema = z.object({
  message: z.string().min(1),
});
export type UserRootPostResponse = z.infer<typeof userRootPostResponseSchema>;
