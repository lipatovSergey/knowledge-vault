import { z } from "zod";
// TODO: After migration update validate-reset-token to use
// type ResetTokenDto = z.infer<typeof passwordResetToken>

const authSchemas = {
  userLogin: z.object({
    email: z.string().min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
  }),

  passwordForgot: z.object({
    email: z.email("Invalid email"),
  }),
  passwordResetToken: z.object({
    token: z
      .string()
      .regex(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, "Invalid token format"),
  }),
  passwordResetPasswords: z
    .object({
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
      newPasswordConfirmation: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirmation, {
      message: "Passwords do not match",
    }),
};

export type LoginUserDto = z.infer<typeof authSchemas.userLogin>;
export type ForgotPasswordDto = z.infer<typeof authSchemas.passwordForgot>;
export type ResetTokenDto = z.infer<typeof authSchemas.passwordResetToken>;
export type PasswordResetDto = z.infer<
  typeof authSchemas.passwordResetPasswords
>;

export default authSchemas;
