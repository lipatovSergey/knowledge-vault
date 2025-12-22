import { NotFoundError } from "../../../errors/errors.class";
import type { NoteRepository } from "../note.repository.mongo";
import createNoteService from "../note.service";
import {
  DeleteNoteInput,
  GetNoteInput,
  GetNoteListInput,
  NoteDomain,
  NoteListRepoResult,
  PatchNoteInput,
} from "../note.types";

const noteRepo: jest.Mocked<NoteRepository> = {
  create: jest.fn(),
  getNote: jest.fn(),
  deleteNote: jest.fn(),
  updateNote: jest.fn(),
  getNotesList: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getNote", () => {
  const input: GetNoteInput = {
    noteId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439022",
  };
  const noteDomain: NoteDomain = {
    id: "507f1f77bcf86cd799439011",
    title: "title",
    content: "content",
    tags: [],
    createdAt: new Date("2024-03-15T10:20:30.000Z"),
    updatedAt: new Date("2024-03-15T10:20:30.000Z"),
  };

  it("happy path", async () => {
    const service = createNoteService({ noteRepo });
    noteRepo.getNote.mockResolvedValue(noteDomain);
    const result = await service.getNote(input);
    expect(noteRepo.getNote).toHaveBeenCalledWith(input);
    expect(result).toBe(noteDomain);
  });

  it("throws NotFoundError", async () => {
    const service = createNoteService({ noteRepo });
    noteRepo.getNote.mockResolvedValue(null);
    await expect(service.getNote(input)).rejects.toThrow(NotFoundError);
    expect(noteRepo.getNote).toHaveBeenCalledWith(input);
  });
});

describe("deleteNote", () => {
  const input: DeleteNoteInput = {
    noteId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439022",
  };

  it("happy path", async () => {
    const service = createNoteService({ noteRepo });
    noteRepo.deleteNote.mockResolvedValue(true);
    const result = await service.deleteNote(input);
    expect(noteRepo.deleteNote).toHaveBeenCalledWith(input);
    expect(result).toBe(true);
  });

  it("throws NotFoundError", async () => {
    const service = createNoteService({ noteRepo });
    noteRepo.deleteNote.mockResolvedValue(false);
    await expect(service.deleteNote(input)).rejects.toThrow(NotFoundError);
    expect(noteRepo.deleteNote).toHaveBeenCalledWith(input);
  });
});

describe("updateNote", () => {
  const input: PatchNoteInput = {
    noteId: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439022",
    data: { title: "changed-title" },
  };
  const noteDomain: NoteDomain = {
    id: "507f1f77bcf86cd799439011",
    title: "changed-title",
    content: "content",
    tags: [],
    createdAt: new Date("2024-03-15T10:20:30.000Z"),
    updatedAt: new Date("2024-03-15T10:20:30.000Z"),
  };

  it("happy path", async () => {
    const service = createNoteService({ noteRepo });
    noteRepo.updateNote.mockResolvedValue(noteDomain);
    const result = await service.updateNote(input);
    expect(noteRepo.updateNote).toHaveBeenCalledWith(input);
    expect(result).toBe(noteDomain);
  });

  it("throws NotFoundError", async () => {
    const service = createNoteService({ noteRepo });
    noteRepo.updateNote.mockResolvedValue(null);
    await expect(service.updateNote(input)).rejects.toThrow(NotFoundError);
    expect(noteRepo.updateNote).toHaveBeenCalledWith(input);
  });
});

describe("getNotesList", () => {
  const input: GetNoteListInput = {
    userId: "507f1f77bcf86cd799439022",
    fields: ["title", "updatedAt"],
    page: 1,
    limit: 1,
    search: undefined,
    tags: undefined,
  };
  const repoResult: NoteListRepoResult = {
    data: [
      {
        id: "507f1f77bcf86cd799439011",
        title: "changed-title",
        content: "content",
        tags: [],
        createdAt: new Date("2024-03-15T10:20:30.000Z"),
        updatedAt: new Date("2024-03-15T10:20:30.000Z"),
      },
    ],
    total: 1,
  };

  it("repo returns list of notes", async () => {
    const service = createNoteService({ noteRepo });
    noteRepo.getNotesList.mockResolvedValue(repoResult);
    const { page, limit, userId, fields, search, tags } = input;
    const skip = (page - 1) * limit;
    const result = await service.getNotesList(input);
    expect(noteRepo.getNotesList).toHaveBeenCalledWith({
      userId,
      fields,
      skip,
      limit,
      search,
      tags,
    });
    expect(result).toEqual({ ...repoResult, page, limit });
  });
});
