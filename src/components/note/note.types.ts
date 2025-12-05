import type { AllowedNoteFields } from "../../contracts/note/root.contract";
import type { NoteTagsArray } from "../../contracts/note/shared.contract";
import type { MongoId, NoteContent, NoteTitle, Tag } from "../../types/primitives";

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
  fields: ReadonlyArray<AllowedNoteFields>;
  page: number;
  limit: number;
  search: string | undefined;
  tags: Tag[] | undefined;
};

export type GetNoteListRepoInput = {
  userId: MongoId;
  fields: ReadonlyArray<AllowedNoteFields>;
  skip: number;
  limit: number;
  search: string | undefined;
  tags: Tag[] | undefined;
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
  title?: NoteTitle;
  content?: NoteContent;
  tags?: NoteTagsArray;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NoteListRepoResult = {
  data: ListItemDomain[];
  total: number;
};

export type NoteListResult = {
  data: ListItemDomain[];
  total: number;
  page: number;
  limit: number;
};
