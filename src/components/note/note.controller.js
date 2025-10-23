const { noteService } = require("./index.js");

const noteController = {
  async createNote(req, res, next) {
    try {
      const noteData = {
        title: req.validatedBody.title,
        content: req.validatedBody.content,
        userId: req.session.userId,
      };

      const newNote = await noteService.createNote(noteData);
      res.status(201).json(newNote);
    } catch (error) {
      next(error);
    }
  },

  // returns note mapped info, only for note's owner
  async getNote(req, res, next) {
    try {
      const noteId = req.validatedParams.id;
      const userId = req.session.userId;
      const noteInfo = await noteService.getNote(noteId, userId);
      res.status(200).json(noteInfo);
    } catch (error) {
      next(error);
    }
  },

  // deletes note from db, only for note's owner
  async deleteNote(req, res, next) {
    try {
      const noteId = req.validatedParams.id;
      const userId = req.session.userId;
      await noteService.deleteNote(noteId, userId);
      res.status(200).json({ message: "Note deleted" });
    } catch (error) {
      next(error);
    }
  },

  // updates note's title or content or both
  async patchNote(req, res, next) {
    try {
      const noteId = req.validatedParams.id;
      const userId = req.session.userId;
      const data = req.validatedBody;
      const updatedNote = await noteService.updateNote(noteId, userId, data);

      res.status(200).json(updatedNote);
    } catch (error) {
      next(error);
    }
  },

  // gets array of all user's notes
  async getNotesList(req, res, next) {
    try {
      const userId = req.session.userId;
      const notesList = await noteService.getNotesList(userId);

      res.status(200).json(notesList);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = noteController;
