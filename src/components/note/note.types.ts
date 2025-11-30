import type { AllowedNoteFields } from "../../contracts/note/root.contract";
import type { NoteTagsArray } from "../../contracts/note/shared.contract";
import type { MongoId, NoteContent, NoteTitle } from "../../types/primitives";

export type CreateNoteInput = {
  userId: MongoId;
  title: NoteTitle;
  content: NoteContent;
  tags?: NoteTagsArray;
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
    tags?: NoteTagsArray;
  };
};

export type GetNoteListInput = {
  userId: MongoId;
  fields?: ReadonlyArray<AllowedNoteFields>;
};

export type NoteDomain = {
  id: MongoId;
  title: NoteTitle;
  content: NoteContent;
  tags: NoteTagsArray;
  createdAt: Date;
  updatedAt: Date;
};

export type ListItemDomain = {
  id: MongoId;
  title: NoteTitle;
  content?: NoteContent;
  tags?: NoteTagsArray;
  createdAt: Date;
  updatedAt: Date;
};
