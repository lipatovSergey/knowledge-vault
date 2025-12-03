import { Types } from "mongoose";
import { NoteDocument, NoteModel, NoteSchemaType } from "../../src/components/note/note.model";
import { MongoId } from "../../src/types/primitives";

export async function insertNotesDirectly(
  userId: MongoId,
  amount: number = 1,
): Promise<NoteDocument[]> {
  const notes: Array<
    Pick<NoteSchemaType, "userId" | "title" | "content" | "tags" | "updatedAt" | "createdAt">
  > = [];
  const now = Date.now();
  for (let i = amount; i > 0; i--) {
    notes.push({
      userId: new Types.ObjectId(userId),
      title: `title-${i}`,
      content: `content-${i}`,
      tags: ["tag1", "tag2"],
      updatedAt: new Date(now + i),
      createdAt: new Date(now + i),
    });
  }
  return NoteModel.insertMany(notes);
}
