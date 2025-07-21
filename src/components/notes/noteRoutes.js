const express = require("express");
const router = express.Router();

const noteController = require("./noteController");

router.post("/", noteController.createNote);

module.exports = router;
