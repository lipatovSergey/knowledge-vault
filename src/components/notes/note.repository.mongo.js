const NoteModel = require("./note.model");

// methods of note
const noteRepo = {
	// saves new document to MongoDB and return it
	async create(noteData) {
		const newNote = new NoteModel(noteData);
		return await newNote.save();
	},

	// finds and returns note info from DB
	async getNote(noteId) {
		const noteInfo = await NoteModel.findById(noteId);
		return noteInfo;
	},
};

module.exports = noteRepo;
