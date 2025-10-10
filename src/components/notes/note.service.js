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

		// use-case: get single note info
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
	};
}

module.exports = {
	createNoteService,
};
