import type { MongoId, NoteContent, NoteTitle } from "../../types/primitives";

export type CreateNoteInput = {
  userId: MongoId;
  title: NoteTitle;
  content: NoteContent;
};

export type GetNoteInput = {
  noteId: MongoId;
  userId: MongoId;
};

export type DeleteNoteInput = {
  noteId: MongoId;
  userId: MongoId;
};

export type PatchNoteInput = {
  noteId: MongoId;
  userId: MongoId;
  data: {
    title?: NoteTitle;
    content?: NoteContent;
  };
};

export type NoteDomain = {
  id: MongoId;
  title: NoteTitle;
  content: NoteContent;
  createdAt: Date;
  updatedAt: Date;
};
