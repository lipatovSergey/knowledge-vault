const requireAuth = require("../../middleware/require-auth.middleware.js");
const validateBody = require("../../middleware/validate-body.middleware.js");
const validateParams = require("../../middleware/validate-params.middleware.js");
import noteSchemas from "./note.validator";

import noteController from "./note.controller";
import express from "express";
const router = express.Router();

// create new note
router.post(
  "/",
  requireAuth,
  validateBody(noteSchemas.createNote),
  noteController.createNote,
);

// get list of all user's notes
router.get("/", requireAuth, noteController.getNotesList);

router.get(
  "/:id",
  requireAuth,
  validateParams(noteSchemas.noteIdInParams),
  noteController.getNote,
);

router.delete(
  "/:id",
  requireAuth,
  validateParams(noteSchemas.noteIdInParams),
  noteController.deleteNote,
);

router.patch(
  "/:id",
  requireAuth,
  validateParams(noteSchemas.noteIdInParams),
  validateBody(noteSchemas.patchNote),
  noteController.patchNote,
);

export default router;
