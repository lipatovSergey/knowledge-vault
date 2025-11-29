import requireAuth from "../../middleware/require-auth.middleware";
import validateBody from "../../middleware/validate-body.middleware";
import validateParams from "../../middleware/validate-params.middleware";
import noteController from "./note.controller";
import express, { RequestHandler } from "express";
import {
  noteRootGetRequestQuerySchema,
  noteRootPostRequestSchema,
} from "../../contracts/note/root.contract";
import { noteIdInParamsSchema, noteIdPatchRequestSchema } from "../../contracts/note/id.contract";
import validateQuery from "../../middleware/validate-query.middleware";
const router = express.Router();

// create new note
router.post(
  "/",
  requireAuth,
  validateBody(noteRootPostRequestSchema),
  noteController.createNote as RequestHandler,
);

// get list of all user's notes
router.get(
  "/",
  requireAuth,
  validateQuery(noteRootGetRequestQuerySchema),
  noteController.getNotesList,
);

router.get(
  "/:id",
  requireAuth,
  validateParams(noteIdInParamsSchema),
  noteController.getNote as RequestHandler,
);

router.delete(
  "/:id",
  requireAuth,
  validateParams(noteIdInParamsSchema),
  noteController.deleteNote as RequestHandler,
);

router.patch(
  "/:id",
  requireAuth,
  validateParams(noteIdInParamsSchema),
  validateBody(noteIdPatchRequestSchema),
  noteController.patchNote as RequestHandler,
);

export default router;
