import type { NoteRootPostResponse } from "../../contracts/note/root.contract";
import type { WithId } from "../../types/primitives";
import type { NoteSchemaType, NoteDocument } from "./note.model";
import type { NoteDomain } from "./note.types";

// type guard
function isNoteDocument(value: unknown): value is NoteDocument {
  return (
    value !== null &&
    typeof value === "object" &&
    "toObject" in value &&
    typeof (value as any).toObject === "function"
  );
}

function noteToObject(rawNote: WithId<NoteSchemaType> | NoteDocument) {
  return isNoteDocument(rawNote) ? rawNote.toObject() : rawNote;
}

export function mapPersistNoteToDomain(rawNote: WithId<NoteSchemaType> | NoteDocument): NoteDomain {
  const noteObject = noteToObject(rawNote);

  return {
    id: noteObject._id.toString(),
    title: noteObject.title,
    content: noteObject.content,
    createdAt: new Date(noteObject.createdAt),
    updatedAt: new Date(noteObject.updatedAt),
  };
}

export function mapDomainNoteToContract(domainNote: NoteDomain): NoteRootPostResponse {
  return {
    id: domainNote.id.toString(),
    title: domainNote.title,
    content: domainNote.content,
    createdAt: domainNote.createdAt.toISOString(),
    updatedAt: domainNote.updatedAt.toISOString(),
  };
}
