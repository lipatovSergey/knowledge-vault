import type { WithId } from "../../types/mongo";
import type { NoteSchemaType, NoteDocument } from "./note.model";
import type { NoteDto } from "./note.types";

// type guard
function isNoteDocument(value: unknown): value is NoteDocument {
  return (
    value !== null &&
    typeof value === "object" &&
    "toObject" in value &&
    typeof (value as any).toObject === "function"
  );
}

function toNoteDto(rawNote: WithId<NoteSchemaType> | NoteDocument): NoteDto {
  // if we got note as plain object use it as it is
  // if note mongoose document use build in toObject method to create plain object
  const source = isNoteDocument(rawNote) ? rawNote.toObject() : rawNote;

  return {
    id: source._id.toString(),
    title: source.title,
    content: source.content,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

export default toNoteDto;
