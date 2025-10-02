const express = require("express");
const authController = require("./auth.controller.js");
const validate = require("../../middleware/validate.middleware.js");
const validateToken = require("../../middleware/validate-token.middleware.js");
const { schemas } = require("./auth.validator.js");
const requireGuest = require("../../middleware/require-guest.middleware.js");
const requireAuth = require("../../middleware/require-auth.middleware.js");

const router = express.Router();

// login user
router.post(
	"/login",
	requireGuest,
	validate(schemas.userLogin),
	authController.loginUser
);

// log-out authenticated (logged in) user
router.post("/logout", requireAuth, authController.logoutUser);

// user forgot his password
router.post(
	"/password/forgot",
	validate(schemas.passwordForgot),
	authController.forgotPassword
);

// reset user's password
router.post(
	"/password/reset",
	validateToken(schemas.passwordResetToken),
	validate(schemas.passwordResetPasswords),
	authController.resetPassword
);

module.exports = router;
