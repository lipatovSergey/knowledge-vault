import { NoteModel } from "./note.model";
import { mapPersistNoteToDomain, mapPersistNoteToDomainListItem } from "./note.mapper";
import type {
  CreateNoteInput,
  DeleteNoteInput,
  GetNoteInput,
  GetNoteListRepoInput,
  NoteDomain,
  NoteListRepoResult,
  PatchNoteInput,
} from "./note.types";
import { normalizeSearchString } from "../../utils/search-string-normalize.util";
import { title } from "node:process";

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
  async getNotesList(input: GetNoteListRepoInput): Promise<NoteListRepoResult> {
    const { userId, fields, limit, skip, search, tags } = input;
    const projection = fields.reduce<Record<string, 1>>((acc, f) => {
      acc[f] = 1;
      return acc;
    }, {});
    const filter = {
      userId,
      ...(search
        ? (() => {
            const normalized = normalizeSearchString(search);
            const regex = new RegExp(normalized, "i");
            return {
              $or: [{ title: regex }, { content: regex }],
            };
          })()
        : {}),
      ...(tags ? { tags: { $all: tags } } : {}),
    };
    const result = await NoteModel.find(filter)
      .select(projection)
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .lean();
    const total = await NoteModel.countDocuments(filter);
    const data = result.map((doc) => mapPersistNoteToDomainListItem(doc, fields));
    return { data, total };
  },
};

export type NoteRepository = typeof noteRepo;
export default noteRepo;
