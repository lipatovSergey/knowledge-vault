import { z } from "zod";
import { Types } from "mongoose";

const noteSchemas = {
  // body
  createNote: z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(120, "Title max length 120 symbols"),
    content: z
      .string()
      .trim()
      .min(1, "Content is required")
      .max(2000, "Content max length 2000 symbols"),
  }),
  // params
  noteIdInParams: z.object({
    id: z
      .string()
      .refine((value) => Types.ObjectId.isValid(value), "Invalid ObjectId"),
  }),
  // body
  patchNote: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(120, "Title max length 120 symbols")
        .optional(),
      content: z
        .string()
        .trim()
        .min(1, "Content is required")
        .max(2000, "Content max length 2000 symbols")
        .optional(),
    })
    .refine((data) => data.title !== undefined || data.content !== undefined, {
      message: "Title or content required",
    }),
};

export type CreateNoteDto = z.infer<typeof noteSchemas.createNote>;
export type UpdateNoteDto = z.infer<typeof noteSchemas.patchNote>;
export type NoteIdInParams = z.infer<typeof noteSchemas.noteIdInParams>;

export default noteSchemas;
