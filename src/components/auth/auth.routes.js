const express = require("express");
const authController = require("./auth.controller.js");

const router = express.Router();

router.post("/password/forgot", authController.forgotPassword);

module.exports = router;
