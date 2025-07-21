const express = require("express");
const noteController = require("./noteController");

const router = express.Router();
router.post("/", noteController.createNote);

module.exports = router;
