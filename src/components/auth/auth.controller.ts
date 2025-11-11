import userService from "../user";
import mailService from "../../services/mail";
import { UnauthorizedError } from "../../errors/errors.class";
import destroySession from "../../utils/destroy-session.util";
import tokenService from "./token";
import regenerateSession from "../../utils/regenerate-session.util";
import type { Request, Response, NextFunction } from "express";
import type { RequestWithValidatedBody } from "../../types/validated-request";
import type { ForgotPasswordDto, PasswordResetDto } from "./auth.validator";
import type { RequestWithValidatedResetToken } from "../../types/express";
import type { AuthUserDomain, LoginInput } from "./auth.types";
import type { AuthLoginRequest, AuthLoginResponse } from "../../contracts/auth/login.contract";
import { mapDomainAuthToContract } from "./auth.mapper";
import authService from ".";

const authController = {
  async loginUser(
    req: RequestWithValidatedBody<AuthLoginRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const loginInput: LoginInput = {
        email: req.validatedBody.email,
        password: req.validatedBody.password,
      };

      const authUserDomain: AuthUserDomain = await authService.login(loginInput);
      // regenerate session ID for authenticated user
      await regenerateSession(req);
      req.session.userId = authUserDomain.id;

      const authUserContract: AuthLoginResponse = mapDomainAuthToContract(authUserDomain);
      return res.status(200).json(authUserContract);
    } catch (error) {
      next(error);
    }
  },

  async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      await destroySession(req);
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(
    req: RequestWithValidatedBody<ForgotPasswordDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const email = req.validatedBody.email;
      // We try to find the user. If the service throws UnauthorizedError (user not found),
      // we catch it and treat it as a "success" from a security perspective to prevent email enumeration.
      const user = await userService.findUserByEmail(email).catch((err) => {
        if (err instanceof UnauthorizedError) return null;
        throw err;
      });

      if (user) {
        const rawToken = await tokenService.createTokenForUser(user.id);
        // TODO: заменить на FRONTEND_URL из config/env
        const frontendBaseUrl = "localhost:2173";
        const resetLink = `${frontendBaseUrl.replace(/\/$/, "")}/password-reset?token=${rawToken}`;
        await mailService.sendPasswordReset({
          to: email,
          subject: "Reset your password",
          text: `To reset your password please use the following link ${resetLink}`,
          html: `<p>Hello,</p><p>You requested a password reset. Please click the link below to set a new password:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
          meta: { rawToken }, // for tests
        });
      }

      return res.status(204).end();
    } catch (err) {
      return next(err);
    }
  },

  async resetPassword(
    req: RequestWithValidatedBody<PasswordResetDto> & RequestWithValidatedResetToken,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body = req.validatedBody;
      const token = req.validatedResetToken;
      const userId = await tokenService.verifyAndConsume(token);
      await userService.updateUserPassword(userId, body.newPassword);
      await tokenService.removeAllTokensForUser(userId);
      await destroySession(req);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};

export default authController;
