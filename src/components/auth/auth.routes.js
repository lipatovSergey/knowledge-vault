const express = require("express");
const authController = require("./auth.controller.js");
const validateBody = require("../../middleware/validate-body.middleware.js");
const validateResetToken = require("../../middleware/validate-reset-token.middleware.js");
const { schemas } = require("./auth.validator.js");
const requireGuest = require("../../middleware/require-guest.middleware.js");
const requireAuth = require("../../middleware/require-auth.middleware.js");

const router = express.Router();

// login user
router.post(
  "/login",
  requireGuest,
  validateBody(schemas.userLogin),
  authController.loginUser,
);

// log-out authenticated (logged in) user
router.post("/logout", requireAuth, authController.logoutUser);

// user forgot his password
router.post(
  "/password/forgot",
  validateBody(schemas.passwordForgot),
  authController.forgotPassword,
);

// reset user's password
router.post(
  "/password/reset",
  validateResetToken(schemas.passwordResetToken),
  validateBody(schemas.passwordResetPasswords),
  authController.resetPassword,
);

module.exports = router;
