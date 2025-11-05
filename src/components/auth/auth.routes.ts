import express, { RequestHandler } from "express";
import authController from "./auth.controller";
import validateBody from "../../middleware/validate-body.middleware";
import validateResetToken from "../../middleware/validate-reset-token.middleware";
import authSchemas from "./auth.validator";
import requireGuest from "../../middleware/require-guest.middleware";
import requireAuth from "../../middleware/require-auth.middleware";

const router = express.Router();

// login user
router.post(
  "/login",
  requireGuest,
  validateBody(authSchemas.userLogin),
  authController.loginUser as RequestHandler,
);

// log-out authenticated (logged in) user
router.post("/logout", requireAuth, authController.logoutUser);

// user forgot his password
router.post(
  "/password/forgot",
  validateBody(authSchemas.passwordForgot),
  authController.forgotPassword as RequestHandler,
);

// reset user's password
router.post(
  "/password/reset",
  validateResetToken(authSchemas.passwordResetToken),
  validateBody(authSchemas.passwordResetPasswords),
  authController.resetPassword as RequestHandler,
);

export default router;
