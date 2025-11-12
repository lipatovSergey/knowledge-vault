import mailService from "../../services/mail";
import { UnauthorizedError } from "../../errors/errors.class";
import type { UserService } from "../user";
import type { AuthUserDomain, ForgotPasswordInput, LoginInput } from "./auth.types";
import type { TokenService } from "./token";
import { FRONTEND_URL } from "../../config/env";

function createAuthService({
  userService,
  tokenService,
}: {
  userService: UserService;
  tokenService: TokenService;
}) {
  return {
    async login(loginInput: LoginInput): Promise<AuthUserDomain> {
      return userService.authenticateUser(loginInput);
    },

    async forgotPassword(input: ForgotPasswordInput): Promise<void> {
      // We try to find the user. If the service throws UnauthorizedError (user not found),
      // we catch it and treat it as a "success" from a security perspective to prevent email enumeration.
      const { email } = input;
      const user = await userService.findUserByEmail(email).catch((err) => {
        if (err instanceof UnauthorizedError) return null;
        throw err;
      });
      if (user) {
        const rawToken = await tokenService.createTokenForUser(user.id);
        const frontendBaseUrl = FRONTEND_URL;
        const resetLink = `${frontendBaseUrl.replace(/\/$/, "")}/password-reset?token=${rawToken}`;
        await mailService.sendPasswordReset({
          to: email,
          subject: "Reset your password",
          text: `To reset your password please use the following link ${resetLink}`,
          html: `<p>Hello,</p><p>You requested a password reset. Please click the link below to set a new password:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
          meta: { rawToken }, // for tests
        });
      }
    },
  };
}

export default createAuthService;
