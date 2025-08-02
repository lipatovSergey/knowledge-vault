const NoteModel = require("./note.model");

// methods of note
const noteRepo = {
	// saves new document to MongoDB and return it
	async create(noteData) {
		const newNote = new NoteModel(noteData);
		return await newNote.save();
	},
};

module.exports = noteRepo;
