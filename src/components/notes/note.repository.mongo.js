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

  // find and returns note's owners's id
  async getNoteOwnerId(noteId) {
    const noteInfo = await NoteModel.findById(noteId).select("userId").lean();
    if (!noteInfo) {
      return null;
    }
    return noteInfo.userId;
  },

  // deletes note from db by ID
  async deleteNote(noteId) {
    const { deletedCount } = await NoteModel.deleteOne({ _id: noteId });
    return deletedCount === 1;
  },
};

module.exports = noteRepo;
