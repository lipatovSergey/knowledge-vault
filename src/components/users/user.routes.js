const express = require("express");
const userController = require("./user.controller.js");
// middlewares
const requireAuth = require("../../middleware/require-auth.middleware.js");
const validate = require("../../middleware/validate.middleware.js");
// validate chemas
const { schemas } = require("./user.validator.js");

const router = express.Router();
// create new user
router.post("/", validate(schemas.userCreate), userController.createUser);
// get user's info by himself (authenticated)
router.get("/me", requireAuth, userController.getUserInfo);
// delete user by himself(authenticated)
router.delete("/me", requireAuth, userController.deleteUser);
// update user info
router.patch(
	"/me",
	requireAuth,
	validate(schemas.userInfoPatch),
	userController.updateUserName
);

module.exports = router;
