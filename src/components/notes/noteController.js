const noteServices = require("./noteServices");
const noteRepo = require("./note.repository.mongo");

const noteController = {
	async createNote(req, res, next) {
		try {
			const noteData = {
				title: req.body.title,
				content: req.body.content,
				tags: req.body.tags || [],
				linkedNotes: req.body.linkedNotes || [],
				userId: "64fdbddf8d8be23b7ce12340", // TODO: later add auth middleware
			};

			const newNote = await noteServices.createNote(noteData, noteRepo);
			res.status(201).json(newNote);
		} catch (error) {
			next(error);
		}
	},
};

module.exports = noteController;
