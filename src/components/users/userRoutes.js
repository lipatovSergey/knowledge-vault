const express = require("express");
const userController = require("./userController");
const requireAuth = require("../../middleware/requireAuth.js");

const router = express.Router();
router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/logout", requireAuth, userController.logoutUser);
router.get("/me", requireAuth, userController.getUserInfo);

module.exports = router;
