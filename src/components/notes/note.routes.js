const express = require("express");
const noteController = require("./note.controller");
const requireAuth = require("../../middleware/require-auth.middleware.js");
const validate = require("../../middleware/validate.middleware.js");
const { schemas } = require("./note.validator.js");

const router = express.Router();

// create new note
router.post(
	"/",
	requireAuth,
	validate(schemas.createNote),
	noteController.createNote
);

module.exports = router;
