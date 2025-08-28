const express = require("express");
const authController = require("./auth.controller.js");
const validate = require("../../middleware/validate.middleware.js");
const { schemas } = require("./auth.validator.js");

const router = express.Router();

router.post(
  "/password/forgot",
  validate(schemas.passwordForgot),
  authController.forgotPassword,
);

router.post(
  "/password/reset",
  validate(schemas.passwordReset),
  authController.resetPassword,
);
module.exports = router;
