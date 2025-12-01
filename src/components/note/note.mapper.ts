import type { AllowedNoteFields } from "../../contracts/note/root.contract";
import type { WithId } from "../../types/primitives";
import type { NoteSchemaType, NoteDocument } from "./note.model";
import type { ListItemDomain, NoteDomain } from "./note.types";
import { NoteContract, NoteListItemContract } from "../../contracts/note/shared.contract";

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
    tags: noteObject.tags,
    createdAt: new Date(noteObject.createdAt),
    updatedAt: new Date(noteObject.updatedAt),
  };
}

export function mapPersistNoteToDomainListItem(
  rawNote: WithId<NoteSchemaType> | NoteDocument,
  fields: ReadonlyArray<AllowedNoteFields> | undefined,
): ListItemDomain {
  const noteObject = noteToObject(rawNote);
  const out: ListItemDomain = {
    id: noteObject._id.toString(),
    title: noteObject.title,
    createdAt: new Date(noteObject.createdAt),
    updatedAt: new Date(noteObject.updatedAt),
  };
  if (fields) {
    for (const f of fields) {
      if (f === "content" && noteObject.content) {
        out.content = noteObject.content;
      } else if (f === "tags") {
        out.tags = noteObject.tags ?? [];
      }
    }
  }
  return out;
}

export function mapDomainListItemToContract(
  domainListItem: ListItemDomain,
  fields: ReadonlyArray<AllowedNoteFields> | undefined,
) {
  const out: NoteListItemContract = {
    id: domainListItem.id.toString(),
    title: domainListItem.title,
    createdAt: domainListItem.createdAt.toISOString(),
    updatedAt: domainListItem.updatedAt.toISOString(),
  };
  if (fields) {
    for (const f of fields) {
      if (f in domainListItem && domainListItem[f]) {
        if (f === "content" && domainListItem.content) {
          out.content = domainListItem.content;
        } else if (f === "tags") {
          out.tags = domainListItem.tags ?? [];
        }
      }
    }
  }
  return out;
}

export function mapDomainNoteToContract(domainNote: NoteDomain): NoteContract {
  return {
    id: domainNote.id.toString(),
    title: domainNote.title,
    content: domainNote.content,
    tags: domainNote.tags,
    createdAt: domainNote.createdAt.toISOString(),
    updatedAt: domainNote.updatedAt.toISOString(),
  };
}
