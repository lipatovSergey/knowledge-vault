import z from "zod";
import { passwordResetTokenSchema } from "../../types/primitives";

export const passwordResetBodyRequestSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPasswordConfirmation: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Passwords do not match",
  });
export type PasswordResetBodyRequestSchema = z.infer<typeof passwordResetBodyRequestSchema>;

export const passwordResetTokenRequestSchema = z.object({
  token: passwordResetTokenSchema,
});
export type PasswordResetTokenRequestSchema = z.infer<typeof passwordResetTokenRequestSchema>;
