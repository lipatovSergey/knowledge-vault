import noteService from "./index";
import { mapDomainNoteToContract, mapDomainListItemToContract } from "./note.mapper";
import type { Response, NextFunction } from "express";
import type { NoteIdInParams, NoteIdPatchRequest } from "../../contracts/note/id.contract";
import type { MongoId } from "../../types/primitives";
import type {
  RequestWithValidatedBody,
  RequestWithValidatedParams,
  RequestWithValidatedQuery,
} from "../../types/validated-request";
import type {
  NoteRootGetRequestQuery,
  NoteRootPostRequest,
} from "../../contracts/note/root.contract";
import type {
  CreateNoteInput,
  DeleteNoteInput,
  GetNoteInput,
  NoteDomain,
  PatchNoteInput,
} from "./note.types";

const noteController = {
  async createNote(
    req: RequestWithValidatedBody<NoteRootPostRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body = req.validatedBody;
      const userId = req.session.userId as MongoId;

      const createNoteInput: CreateNoteInput = {
        userId: userId,
        ...body,
      };

      const note: NoteDomain = await noteService.createNote(createNoteInput);
      res.status(201).json(mapDomainNoteToContract(note));
    } catch (error) {
      next(error);
    }
  },

  // should return note mapped info, only for note's owner
  async getNote(
    req: RequestWithValidatedParams<NoteIdInParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const params = req.validatedParams;
      const noteId: MongoId = params.id;
      const userId = req.session.userId as MongoId;
      const getNoteInput: GetNoteInput = {
        noteId,
        userId,
      };
      const note: NoteDomain = await noteService.getNote(getNoteInput);
      res.status(200).json(mapDomainNoteToContract(note));
    } catch (error) {
      next(error);
    }
  },

  // deletes note from db, only for note's owner
  async deleteNote(
    req: RequestWithValidatedParams<NoteIdInParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const params = req.validatedParams;
      const noteId = params.id;
      const userId = req.session.userId as MongoId;
      const deleteNoteInput: DeleteNoteInput = {
        noteId,
        userId,
      };
      await noteService.deleteNote(deleteNoteInput);
      res.status(200).json({ message: "Note deleted" });
    } catch (error) {
      next(error);
    }
  },

  // updates note's title or content or both
  async patchNote(
    req: RequestWithValidatedBody<NoteIdPatchRequest> & RequestWithValidatedParams<NoteIdInParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const params = req.validatedParams;
      const noteId = params.id;
      const userId = req.session.userId as MongoId;
      const data = req.validatedBody;
      const patchNoteInput: PatchNoteInput = {
        noteId,
        userId,
        data,
      };
      const note: NoteDomain = await noteService.updateNote(patchNoteInput);

      res.status(200).json(mapDomainNoteToContract(note));
    } catch (error) {
      next(error);
    }
  },

  // gets array of all user's notes
  async getNotesList(
    req: RequestWithValidatedQuery<NoteRootGetRequestQuery>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.session.userId as MongoId;
      const { fields } = req.validatedQuery;
      const notesList = await noteService.getNotesList({ userId, fields });

      res.status(200).json(notesList.map((item) => mapDomainListItemToContract(item, fields)));
    } catch (error) {
      next(error);
    }
  },
};

export default noteController;
