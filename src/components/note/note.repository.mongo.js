const NoteModel = require("./note.model");

// methods of note
const noteRepo = {
  // saves new document to MongoDB and return it
  async create(noteData) {
    const newNote = new NoteModel(noteData);
    return await newNote.save();
  },

  // finds and returns note info from DB. Only for owner
  async getNote(noteId, userId) {
    const noteInfo = await NoteModel.findOne({ _id: noteId, userId }).lean();
    return noteInfo;
  },

  // deletes note from db by ID. Only for owner
  async deleteNote(noteId, userId) {
    const { deletedCount } = await NoteModel.deleteOne({ _id: noteId, userId });
    return deletedCount === 1;
  },

  // updates note in DB. Only for owner
  async updateNote(noteId, userId, data) {
    const result = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId },
      data,
      {
        returnDocument: "after",
        runValidators: true,
        context: "query",
      },
    ).lean();
    return result;
  },
};

module.exports = noteRepo;
