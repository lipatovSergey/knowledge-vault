import { Email, PasswordPlain } from "../../types/primitives";
import { UserDomain } from "../user/user.types";

export type LoginInput = {
  email: Email;
  password: PasswordPlain;
};

export type AuthUserDomain = UserDomain;
