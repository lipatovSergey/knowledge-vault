import { Email, PasswordPlain, PasswordResetToken } from "../../types/primitives";
import { UserDomain } from "../user/user.types";

export type LoginInput = {
  email: Email;
  password: PasswordPlain;
};

export type ForgotPasswordInput = {
  email: Email;
};

export type ResetPasswordInput = {
  token: PasswordResetToken;
  password: PasswordPlain;
};

export type AuthUserDomain = UserDomain;
