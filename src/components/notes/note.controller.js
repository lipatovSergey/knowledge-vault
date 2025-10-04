const { noteService } = require("./index.js");

const noteController = {
	async createNote(req, res, next) {
		try {
			const noteData = {
				title: req.validatedData.title,
				content: req.validatedData.content,
				userId: req.session.userId,
			};

			const newNote = await noteService.createNote(noteData);
			res.status(201).json(newNote);
		} catch (error) {
			next(error);
		}
	},

	async getNote(req, res, next) { 
		try {
			const noteId = req.params.id
			const noteInfo = await noteService.getNote(noteId)
			res.status(200).json(noteInfo)
		} catch (error) {
			next(error)
		}
	}
};

module.exports = noteController;
