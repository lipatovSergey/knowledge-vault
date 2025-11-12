import userService from "../user";
import destroySession from "../../utils/destroy-session.util";
import tokenService from "./token";
import regenerateSession from "../../utils/regenerate-session.util";
import type { Request, Response, NextFunction } from "express";
import type { RequestWithValidatedBody } from "../../types/validated-request";
import type { PasswordResetDto } from "./auth.validator";
import type { RequestWithValidatedResetToken } from "../../types/express";
import type { AuthUserDomain, ForgotPasswordInput, LoginInput } from "./auth.types";
import type { AuthLoginRequest, AuthLoginResponse } from "../../contracts/auth/login.contract";
import { mapDomainAuthToContract } from "./auth.mapper";
import authService from ".";
import { ForgotPasswordRequest } from "../../contracts/auth/forgotPassword.contract";

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
