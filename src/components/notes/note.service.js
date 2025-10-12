const {
  NotFoundError,
  ForbiddenError,
} = require("../../errors/errors.class.js");
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
      const noteInfo = await noteRepo.getNote(noteId);
      if (!noteInfo) {
        throw new NotFoundError("Note not found");
      }
      const noteInfoObject = noteInfo.toObject();
      const noteOwnerId = noteInfoObject.userId.toString();

      if (userId !== noteOwnerId) {
        throw new ForbiddenError();
      }
      return toNoteDto(noteInfo);
    },

    // use-case: delete single note info only for note's owner
    async deleteNote(noteId, userId) {
      // returns objectId
      const noteOwnerId = await noteRepo.getNoteOwnerId(noteId);
      if (!noteOwnerId) {
        throw new NotFoundError("Note not found");
      }

      if (noteOwnerId.toString() !== userId) {
        throw new ForbiddenError();
      }

      const deletedNote = await noteRepo.deleteNote(noteId);
      if (!deletedNote) {
        throw new NotFoundError("Note not found");
      }

      return true;
    },
  };
}

module.exports = {
  createNoteService,
};
