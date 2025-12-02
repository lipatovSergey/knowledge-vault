import { Types } from "mongoose";
import { NoteDocument, NoteModel, NoteSchemaType } from "../../src/components/note/note.model";
import { MongoId } from "../../src/types/primitives";

export async function insertNotesDirectly(
  userId: MongoId,
  amount: number = 1,
): Promise<NoteDocument[]> {
  const notes: Array<Pick<NoteSchemaType, "userId" | "title" | "content" | "tags">> = [];
  for (let i = amount; i > 0; i--) {
    notes.push({
      userId: new Types.ObjectId(userId),
      title: `title-${i}`,
      content: `content-${i}`,
      tags: ["tag1", "tag2"],
    });
  }
  return NoteModel.insertMany(notes);
}
