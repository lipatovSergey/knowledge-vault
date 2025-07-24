const express = require("express");
const userController = require("./userController");
// middlewares
const requireAuth = require("../../middleware/requireAuth.js");
const validate = require("../../middleware/validate.js");
// validate chemas
const { schemas } = require("../users/userValidator.js");

const router = express.Router();
router.post("/", validate(schemas.userCreate), userController.createUser);
router.post("/login", validate(schemas.userLogin), userController.loginUser);
router.post("/logout", requireAuth, userController.logoutUser);
router.get("/me", requireAuth, userController.getUserInfo);

module.exports = router;
