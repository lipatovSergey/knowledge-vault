const requireAuth = require("../../middleware/require-auth.middleware.js");
const validateBody = require("../../middleware/validate-body.middleware.js");
const validateParams = require("../../middleware/validate-params.middleware.js");
const { schemas } = require("./note.validator.js");

import noteController from "./note.controller";
import express from "express";
const router = express.Router();

// create new note
router.post(
  "/",
  requireAuth,
  validateBody(schemas.createNote),
  noteController.createNote,
);

// get list of all user's notes
router.get("/", requireAuth, noteController.getNotesList);

router.get(
  "/:id",
  requireAuth,
  validateParams(schemas.noteIdInParams),
  noteController.getNote,
);

router.delete(
  "/:id",
  requireAuth,
  validateParams(schemas.noteIdInParams),
  noteController.deleteNote,
);

router.patch(
  "/:id",
  requireAuth,
  validateParams(schemas.noteIdInParams),
  validateBody(schemas.patchNote),
  noteController.patchNote,
);

export default router;
