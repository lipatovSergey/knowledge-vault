const express = require("express");
const noteController = require("./note.controller");
const requireAuth = require("../../middleware/require-auth.middleware.js");
const validateBody = require("../../middleware/validate-body.middleware.js");
const validateParams = require("../../middleware/validate-params.middleware.js");
const { schemas } = require("./note.validator.js");

const router = express.Router();

// create new note
router.post(
  "/",
  requireAuth,
  validateBody(schemas.createNote),
  noteController.createNote,
);

router.get(
  "/:id",
  requireAuth,
  validateParams(schemas.getNote),
  noteController.getNote,
);

router.delete(
  "/:id",
  requireAuth,
  validateParams(schemas.deleteNote),
  noteController.deleteNote,
);

module.exports = router;
