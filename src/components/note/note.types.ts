import type { CreateNoteDto } from "./note.validator";
import type { MongoId } from "../../types/mongo";

export type NoteDto = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateNotePayload = CreateNoteDto & { userId: MongoId };
