const { NotFoundError } = require("../../errors/errors.class.js");
const { toNoteDto } = require("./note.mapper.js");

function createNoteService({ noteRepo }) {
  return {
    // Use-case: create new note
    async createNote(noteData) {
      const newNote = await noteRepo.create(noteData);
      return toNoteDto(newNote);
    },

    // use-case: get single note info only for note's owner
    async getNote(noteId, userId) {
      const noteInfo = await noteRepo.getNote(noteId, userId);
      if (!noteInfo) {
        throw new NotFoundError("Note not found");
      }
      return toNoteDto(noteInfo);
    },

    // use-case: delete single note info only for note's owner
    async deleteNote(noteId, userId) {
      const deletedNote = await noteRepo.deleteNote(noteId, userId);
      if (!deletedNote) {
        throw new NotFoundError("Note not found");
      }
      return true;
    },

    // use-case: update single note title or content or both
    async updateNote(noteId, userId, data) {
      const updatedNote = await noteRepo.updateNote(noteId, userId, data);
      if (!updatedNote) {
        throw new NotFoundError("Note not found");
      }

      return toNoteDto(updatedNote);
    },
  };
}

module.exports = {
  createNoteService,
};
