const express = require("express");
const userController = require("./userController");

const router = express.Router();
router.post("/", userController.createUser);

module.exports = router;
