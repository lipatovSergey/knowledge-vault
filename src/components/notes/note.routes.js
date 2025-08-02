const express = require("express");
const noteController = require("./note.controller");

const router = express.Router();
router.post("/", noteController.createNote);

module.exports = router;
