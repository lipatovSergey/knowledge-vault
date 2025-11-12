import destroySession from "../../utils/destroy-session.util";
import regenerateSession from "../../utils/regenerate-session.util";
import { mapDomainAuthToContract } from "./auth.mapper";
import authService from ".";
import type { Request, Response, NextFunction } from "express";
import type { RequestWithValidatedBody } from "../../types/validated-request";
import type { RequestWithValidatedResetToken } from "../../types/express";
import type {
  AuthUserDomain,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from "./auth.types";
import type { AuthLoginRequest, AuthLoginResponse } from "../../contracts/auth/login.contract";
import type { ForgotPasswordRequest } from "../../contracts/auth/password-forgot.contract";
import type { PasswordResetBodyRequest } from "../../contracts/auth/password-reset.contract";

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

      const authUser: AuthUserDomain = await authService.login(loginInput);
      // regenerate session ID for authenticated user
      await regenerateSession(req);
      req.session.userId = authUser.id;

      const authUserContract: AuthLoginResponse = mapDomainAuthToContract(authUser);
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
    req: RequestWithValidatedBody<ForgotPasswordRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const forgotPasswordInput: ForgotPasswordInput = { email: req.validatedBody.email };
      await authService.forgotPassword(forgotPasswordInput);
      return res.status(204).end();
    } catch (err) {
      return next(err);
    }
  },

  async resetPassword(
    req: RequestWithValidatedBody<PasswordResetBodyRequest> & RequestWithValidatedResetToken,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const resetPasswordInput: ResetPasswordInput = {
        password: req.validatedBody.newPassword,
        token: req.validatedResetToken,
      };
      await authService.resetPassword(resetPasswordInput);
      await destroySession(req);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};

export default authController;
