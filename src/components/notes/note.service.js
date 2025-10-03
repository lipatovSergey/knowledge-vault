const { toNoteDto } = require("./note.mapper.js");

function createNoteService({ noteRepo }) {
	return {
		// Use-case: create new note
		async createNote(noteData) {
			const newNote = await noteRepo.create(noteData);
			return toNoteDto(newNote);
		},
	};
}

module.exports = {
	createNoteService,
};
