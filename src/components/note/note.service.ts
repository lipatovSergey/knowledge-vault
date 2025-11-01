const { NotFoundError } = require("../../errors/errors.class.js");
import toNoteDto from "./note.mapper";
import type { MongoId } from "../../types/mongo";
import type { CreateNotePayload, NoteDto } from "./note.types";
import type { NoteRepository } from "./note.repository.mongo";
import type { UpdateNoteDto } from "./note.validator";

function createNoteService({ noteRepo }: { noteRepo: NoteRepository }) {
  return {
    // Use-case: create new note
    async createNote(noteData: CreateNotePayload): Promise<NoteDto> {
      const newNote = await noteRepo.create(noteData);
      return toNoteDto(newNote);
    },

    // use-case: get single note info only for note's owner
    async getNote(noteId: MongoId, userId: MongoId): Promise<NoteDto> {
      const noteInfo = await noteRepo.getNote(noteId, userId);
      if (!noteInfo) {
        throw new NotFoundError("Note not found");
      }
      return toNoteDto(noteInfo);
    },

    // use-case: delete single note info only for note's owner
    async deleteNote(noteId: MongoId, userId: MongoId): Promise<boolean> {
      const deletedNote = await noteRepo.deleteNote(noteId, userId);
      if (!deletedNote) {
        throw new NotFoundError("Note not found");
      }
      return true;
    },

    // use-case: update single note title or content or both
    async updateNote(
      noteId: MongoId,
      userId: MongoId,
      data: UpdateNoteDto,
    ): Promise<NoteDto> {
      const updatedNote = await noteRepo.updateNote(noteId, userId, data);
      if (!updatedNote) {
        throw new NotFoundError("Note not found");
      }

      return toNoteDto(updatedNote);
    },

    // use-case: get all user's notes by user's id
    async getNotesList(userId: MongoId): Promise<NoteDto[]> {
      const notesList = await noteRepo.getNotesList(userId);
      return notesList.map((note) => toNoteDto(note));
    },
  };
}

export default createNoteService;
