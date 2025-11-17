import express, { RequestHandler } from "express";
import authController from "./auth.controller";
import validateBody from "../../middleware/validate-body.middleware";
import validateResetToken from "../../middleware/validate-reset-token.middleware";
import requireGuest from "../../middleware/require-guest.middleware";
import requireAuth from "../../middleware/require-auth.middleware";
import { authLoginRequestSchema } from "../../contracts/auth/login.contract";
import { forgotPasswordRequestSchema } from "../../contracts/auth/password-forgot.contract";
import {
  passwordResetTokenRequestSchema,
  passwordResetBodyRequestSchema,
} from "../../contracts/auth/password-reset.contract";

const router = express.Router();

// login user
router.post(
  "/login",
  requireGuest,
  validateBody(authLoginRequestSchema),
  authController.loginUser as RequestHandler,
);

// log-out authenticated (logged in) user
router.post("/logout", requireAuth, authController.logoutUser);

// user forgot his password
router.post(
  "/password/forgot",
  validateBody(forgotPasswordRequestSchema),
  authController.forgotPassword as RequestHandler,
);

// reset user's password
router.post(
  "/password/reset",
  validateResetToken(passwordResetTokenRequestSchema),
  validateBody(passwordResetBodyRequestSchema),
  authController.resetPassword as RequestHandler,
);

export default router;
