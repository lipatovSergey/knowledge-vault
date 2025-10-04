const { toNoteDto } = require("./note.mapper.js");

function createNoteService({ noteRepo }) {
	return {
		// Use-case: create new note
		async createNote(noteData) {
			const newNote = await noteRepo.create(noteData);
			return toNoteDto(newNote);
		},

		// use-case: get single note info
		async getNote(noteId) {
			const noteInfo = await noteRepo.getNote(noteId)
			return toNoteDto(noteInfo)
		}
	};
}

module.exports = {
	createNoteService,
};
