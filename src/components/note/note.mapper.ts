import type { AllowedNoteFields } from "../../contracts/note/root.contract";
import type { WithId } from "../../types/primitives";
import type { NoteSchemaType, NoteDocument } from "./note.model";
import type { ListItemDomain, NoteDomain } from "./note.types";
import type { NoteContract, NoteListItemContract } from "../../contracts/note/shared.contract";

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
  };
  if (fields) {
    for (const f of fields) {
      if (f === "title" && noteObject.title) {
        out.title = noteObject.title;
      } else if (f === "content" && noteObject.content) {
        out.content = noteObject.content;
      } else if (f === "tags") {
        out.tags = noteObject.tags ?? [];
      } else if (f === "createdAt" && noteObject.createdAt) {
        out.createdAt = new Date(noteObject.createdAt);
      } else if (f === "updatedAt" && noteObject.updatedAt) {
        out.updatedAt = new Date(noteObject.updatedAt);
      }
    }
  }
  return out;
}

export function mapDomainListItemToContract(
  domainListItem: ListItemDomain,
  fields: ReadonlyArray<AllowedNoteFields>,
): NoteListItemContract {
  const out: NoteListItemContract = {
    id: domainListItem.id.toString(),
  };
  for (const f of fields) {
    if (f in domainListItem && domainListItem[f]) {
      if (f === "title" && domainListItem.title) {
        out.title = domainListItem.title;
      } else if (f === "content" && domainListItem.content) {
        out.content = domainListItem.content;
      } else if (f === "tags") {
        out.tags = domainListItem.tags ?? [];
      } else if (f === "createdAt" && domainListItem.createdAt) {
        out.createdAt = domainListItem.createdAt.toISOString();
      } else if (f === "updatedAt" && domainListItem.updatedAt) {
        out.updatedAt = domainListItem.updatedAt.toISOString();
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
