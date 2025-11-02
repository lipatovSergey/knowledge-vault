import noteService from "./index";
import type { Request, Response, NextFunction } from "express";
import type {
  CreateNoteDto,
  NoteIdInParams,
  UpdateNoteDto,
} from "./note.validator";
import type { MongoId } from "../../types/mongo";
import type {
  RequestWithValidatedBody,
  RequestWithValidatedParams,
} from "../../types/validated-request";

const noteController = {
  async createNote(
    req: RequestWithValidatedBody<CreateNoteDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body = req.validatedBody;
      const userId = req.session.userId as MongoId;

      const noteData = {
        title: body.title,
        content: body.content,
        userId: userId,
      };

      const newNote = await noteService.createNote(noteData);
      res.status(201).json(newNote);
    } catch (error) {
      next(error);
    }
  },

  // returns note mapped info, only for note's owner
  async getNote(
    req: RequestWithValidatedParams<NoteIdInParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const params = req.validatedParams;
      const noteId = params.id;
      const userId = req.session.userId as MongoId;
      const noteInfo = await noteService.getNote(noteId, userId);
      res.status(200).json(noteInfo);
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
      await noteService.deleteNote(noteId, userId);
      res.status(200).json({ message: "Note deleted" });
    } catch (error) {
      next(error);
    }
  },

  // updates note's title or content or both
  async patchNote(
    req: RequestWithValidatedBody<UpdateNoteDto> &
      RequestWithValidatedParams<NoteIdInParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const params = req.validatedParams;
      const noteId = params.id;
      const userId = req.session.userId as MongoId;
      const data = req.validatedBody;
      const updatedNote = await noteService.updateNote(noteId, userId, data);

      res.status(200).json(updatedNote);
    } catch (error) {
      next(error);
    }
  },

  // gets array of all user's notes
  async getNotesList(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.session.userId as MongoId;
      const notesList = await noteService.getNotesList(userId);

      res.status(200).json(notesList);
    } catch (error) {
      next(error);
    }
  },
};

export default noteController;
