const NoteModel = require("./note.model");

// methods of note
const noteRepo = {
  // saves new document to MongoDB and return it
  async create(noteData) {
    const newNote = new NoteModel(noteData);
    return await newNote.save();
  },

  // finds and returns note info from DB
  async getNote(noteId, userId) {
    const noteInfo = await NoteModel.findOne({ _id: noteId, userId }).lean();
    return noteInfo;
  },

  // TODO: Check if it's used somewhere
  // find and returns note's owners's id
  async getNoteOwnerId(noteId) {
    const noteInfo = await NoteModel.findById(noteId).select("userId").lean();
    if (!noteInfo) {
      return null;
    }
    return noteInfo.userId;
  },

  // deletes note from db by ID
  async deleteNote(noteId, userId) {
    const { deletedCount } = await NoteModel.deleteOne({ _id: noteId, userId });
    return deletedCount === 1;
  },
};

module.exports = noteRepo;
