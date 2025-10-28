import { NoteDocument, NoteModel, NoteSchemaType } from "./note.model";
import { CreateNoteParams, UpdateNotePayload } from "./note.types";
import { MongoId, WithId } from "../../types/mongo";

// methods of note
const noteRepo = {
  // saves new document to MongoDB and return it
  async create(noteData: CreateNoteParams): Promise<NoteDocument> {
    const newNote = new NoteModel(noteData);
    return await newNote.save();
  },

  // finds and returns note info from DB. Only for owner
  async getNote(
    noteId: MongoId,
    userId: MongoId,
  ): Promise<WithId<NoteSchemaType> | null> {
    const noteInfo = NoteModel.findOne({ _id: noteId, userId }).lean();
    return noteInfo;
  },

  // deletes note from db by ID. Only for owner
  async deleteNote(noteId: MongoId, userId: MongoId): Promise<boolean> {
    const { deletedCount } = await NoteModel.deleteOne({ _id: noteId, userId });
    return deletedCount === 1;
  },

  // updates note in DB. Only for owner
  async updateNote(
    noteId: MongoId,
    userId: MongoId,
    data: UpdateNotePayload,
  ): Promise<WithId<NoteSchemaType> | null> {
    const result = NoteModel.findOneAndUpdate({ _id: noteId, userId }, data, {
      returnDocument: "after",
      runValidators: true,
      context: "query",
    }).lean();
    return result;
  },

  // gets all user's notes sorted from newest to oldest
  async getNotesList(userId: MongoId): Promise<WithId<NoteSchemaType>[]> {
    const result = NoteModel.find({ userId }).sort({ updatedAt: -1 }).lean();
    return result;
  },
};

export default noteRepo;
