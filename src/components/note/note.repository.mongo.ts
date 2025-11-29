import { NoteModel } from "./note.model";
import { mapPersistNoteToDomain, mapPersistNoteToDomainListItem } from "./note.mapper";
import type {
  CreateNoteInput,
  DeleteNoteInput,
  GetNoteInput,
  GetNoteListInput,
  ListItemDomain,
  NoteDomain,
  PatchNoteInput,
} from "./note.types";

// methods of note
const noteRepo = {
  // saves new document to MongoDB and return it
  async create(noteData: CreateNoteInput): Promise<NoteDomain> {
    const newNote = new NoteModel(noteData);
    const savedNote = await newNote.save();
    return mapPersistNoteToDomain(savedNote);
  },

  // finds and should return note info from DB. Only for owner
  async getNote(input: GetNoteInput): Promise<NoteDomain | null> {
    const { noteId, userId } = input;
    const note = await NoteModel.findOne({ _id: noteId, userId }).lean();
    return note ? mapPersistNoteToDomain(note) : null;
  },

  // deletes note from db by ID. Only for owner
  async deleteNote(input: DeleteNoteInput): Promise<boolean> {
    const { noteId, userId } = input;
    const { deletedCount } = await NoteModel.deleteOne({ _id: noteId, userId });
    return deletedCount === 1;
  },

  // updates note in DB. Only for owner
  async updateNote(input: PatchNoteInput): Promise<NoteDomain | null> {
    const { noteId, userId, data } = input;
    const note = await NoteModel.findOneAndUpdate({ _id: noteId, userId }, data, {
      returnDocument: "after",
      runValidators: true,
      context: "query",
    }).lean();
    return note ? mapPersistNoteToDomain(note) : null;
  },

  // gets all user's notes sorted from newest to oldest
  async getNotesList(input: GetNoteListInput): Promise<ListItemDomain[]> {
    const { userId, fields } = input;
    const baseProjection: Record<string, 1> = { _id: 1, createdAt: 1, updatedAt: 1, title: 1 };
    const projection = fields
      ? fields.reduce<Record<string, 1>>(
          (acc, f) => {
            acc[f] = 1;
            return acc;
          },
          { ...baseProjection },
        )
      : { ...baseProjection };
    const result = await NoteModel.find({ userId })
      .select(projection)
      .sort({ updatedAt: -1 })
      .lean();
    return result.map((doc) => mapPersistNoteToDomainListItem(doc, fields));
  },
};

export type NoteRepository = typeof noteRepo;
export default noteRepo;
