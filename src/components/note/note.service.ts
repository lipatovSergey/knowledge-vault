import { NotFoundError } from "../../errors/errors.class";
import type { NoteRepository } from "./note.repository.mongo";
import type {
  CreateNoteInput,
  DeleteNoteInput,
  GetNoteInput,
  GetNoteListInput,
  ListItemDomain,
  NoteDomain,
  PatchNoteInput,
} from "./note.types";

function createNoteService({ noteRepo }: { noteRepo: NoteRepository }) {
  return {
    // Use-case: create new note
    async createNote(input: CreateNoteInput): Promise<NoteDomain> {
      const note = await noteRepo.create(input);
      return note;
    },

    // use-case: get single note info only for note's owner
    async getNote(input: GetNoteInput): Promise<NoteDomain> {
      const note = await noteRepo.getNote(input);
      if (!note) {
        throw new NotFoundError("Note not found");
      }
      return note;
    },

    // use-case: delete single note info only for note's owner
    async deleteNote(input: DeleteNoteInput): Promise<boolean> {
      const deletedNote = await noteRepo.deleteNote(input);
      if (!deletedNote) {
        throw new NotFoundError("Note not found");
      }
      return true;
    },

    // use-case: update single note title or content or both
    async updateNote(input: PatchNoteInput): Promise<NoteDomain> {
      const note = await noteRepo.updateNote(input);
      if (!note) {
        throw new NotFoundError("Note not found");
      }
      return note;
    },

    // use-case: get all user's notes by user's id
    async getNotesList(input: GetNoteListInput): Promise<ListItemDomain[]> {
      const notesList = await noteRepo.getNotesList(input);
      return notesList;
    },
  };
}

export default createNoteService;
