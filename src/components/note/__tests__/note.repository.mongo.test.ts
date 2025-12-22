import { NoteModel } from "../note.model";
import noteRepo from "../note.repository.mongo";
import { GetNoteListRepoInput, NoteListRepoResult } from "../note.types";

describe("getNotesList", () => {
  const docs = [
    {
      _id: "6949155a59acaf46b88aa46f",
      title: "title-1",
      content: "content-1",
    },
    {
      _id: "6949155a59acaf46b88aa46d",
      title: "title-1",
      content: "content-1",
    },
  ];

  const docsMapped = [
    {
      id: "6949155a59acaf46b88aa46f",
      title: "title-1",
      content: "content-1",
    },
    {
      id: "6949155a59acaf46b88aa46d",
      title: "title-1",
      content: "content-1",
    },
  ];

  let findSpy: jest.SpyInstance;
  let countSpy: jest.SpyInstance;
  let findChain: Pick<
    ReturnType<typeof NoteModel.find>,
    "select" | "skip" | "limit" | "sort" | "lean"
  >;

  const baseInput: GetNoteListRepoInput = {
    userId: "507f1f77bcf86cd799439022",
    fields: ["content", "title"],
    skip: 0,
    limit: 1,
    search: undefined,
    tags: undefined,
  };

  beforeEach(() => {
    findChain = {
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(docs),
    };
    findSpy = jest
      .spyOn(NoteModel, "find")
      .mockReturnValue(findChain as unknown as ReturnType<typeof NoteModel.find>);
    countSpy = jest.spyOn(NoteModel, "countDocuments").mockResolvedValue(docs.length);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns list with projection and total", async () => {
    const input = { ...baseInput };
    const filter = { userId: input.userId };
    const result: NoteListRepoResult = await noteRepo.getNotesList(input);
    expect(findSpy).toHaveBeenCalledWith(filter);
    expect(findChain.select).toHaveBeenCalledWith({ content: 1, title: 1 });
    expect(findChain.skip).toHaveBeenCalledWith(input.skip);
    expect(findChain.limit).toHaveBeenCalledWith(input.limit);
    expect(findChain.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(countSpy).toHaveBeenCalledWith(filter);
    expect(result).toEqual({ data: docsMapped, total: docs.length });
  });

  it("filter accept search and tags correctly", async () => {
    const input = { ...baseInput, search: "1", tags: ["tag1"] };
    const regex = new RegExp(input.search, "i");
    const filter = {
      userId: input.userId,
      $or: [{ title: regex }, { content: regex }],
      tags: { $all: input.tags },
    };
    await noteRepo.getNotesList(input);
    expect(findSpy).toHaveBeenCalledWith(filter);
    expect(countSpy).toHaveBeenCalledWith(filter);
  });

  it("returns empty list when nothing found", async () => {
    (findChain.lean as jest.Mock).mockResolvedValueOnce([]);
    countSpy.mockResolvedValueOnce(0);
    const input = { ...baseInput };
    const result = await noteRepo.getNotesList(input);
    expect(result).toEqual({ data: [], total: 0 });
  });
});
