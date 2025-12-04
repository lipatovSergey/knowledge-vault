import { Types } from "mongoose";
import { NoteDocument, NoteModel, NoteSchemaType } from "../../src/components/note/note.model";
import { MongoId } from "../../src/types/primitives";

export type InsertNotes = (Pick<NoteSchemaType, "title" | "content"> &
  Partial<Pick<NoteSchemaType, "tags" | "updatedAt" | "createdAt">>)[];

export async function insertNotesDirectly(
  userId: MongoId,
  notes: InsertNotes,
): Promise<NoteDocument[]> {
  const insertNotes = notes.map((n) => ({ ...n, userId: new Types.ObjectId(userId) }));
  return NoteModel.insertMany(insertNotes) as Promise<NoteDocument[]>;
}
