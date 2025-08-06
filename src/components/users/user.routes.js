const express = require("express");
const userController = require("./user.controller.js");
// middlewares
const requireAuth = require("../../middleware/require-auth.middleware.js");
const validate = require("../../middleware/validate.middleware.js");
// validate chemas
const { schemas } = require("./user.validator.js");

const router = express.Router();
router.post("/", validate(schemas.userCreate), userController.createUser);
router.post("/login", validate(schemas.userLogin), userController.loginUser);
router.post("/logout", requireAuth, userController.logoutUser);
router.get("/me", requireAuth, userController.getUserInfo);
router.delete("/me", requireAuth, userController.deleteUser);

module.exports = router;
