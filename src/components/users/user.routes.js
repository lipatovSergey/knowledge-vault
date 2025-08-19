const express = require("express");
const userController = require("./user.controller.js");
// middlewares
const requireAuth = require("../../middleware/require-auth.middleware.js");
const requireGuest = require("../../middleware/require-guest.middleware.js");
const validate = require("../../middleware/validate.middleware.js");
// validate chemas
const { schemas } = require("./user.validator.js");

const router = express.Router();
// create new user
router.post("/", validate(schemas.userCreate), userController.createUser);
// log-in
router.post(
  "/login",
  requireGuest,
  validate(schemas.userLogin),
  userController.loginUser,
);
// log-out authenticated (logged in) user
router.post("/logout", requireAuth, userController.logoutUser);
// get user's info by himself (authenticated)
router.get("/me", requireAuth, userController.getUserInfo);
// delete user by himself(authenticated)
router.delete("/me", requireAuth, userController.deleteUser);
// update user info
router.patch(
  "/me",
  requireAuth,
  validate(schemas.userInfoPatch),
  userController.updateUserInfo,
);

module.exports = router;
