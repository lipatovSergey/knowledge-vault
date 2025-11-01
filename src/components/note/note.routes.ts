const requireAuth = require("../../middleware/require-auth.middleware.js");
import validateBody from "../../middleware/validate-body.middleware";
import validateParams from "../../middleware/validate-params.middleware";
import noteSchemas from "./note.validator";

import noteController from "./note.controller";
import express, { RequestHandler } from "express";
const router = express.Router();

// create new note
router.post(
  "/",
  requireAuth,
  validateBody(noteSchemas.createNote),
  noteController.createNote as RequestHandler,
);

// get list of all user's notes
router.get("/", requireAuth, noteController.getNotesList);

router.get(
  "/:id",
  requireAuth,
  validateParams(noteSchemas.noteIdInParams),
  noteController.getNote as RequestHandler,
);

router.delete(
  "/:id",
  requireAuth,
  validateParams(noteSchemas.noteIdInParams),
  noteController.deleteNote as RequestHandler,
);

router.patch(
  "/:id",
  requireAuth,
  validateParams(noteSchemas.noteIdInParams),
  validateBody(noteSchemas.patchNote),
  noteController.patchNote as RequestHandler,
);

export default router;
