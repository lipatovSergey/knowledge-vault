import z from "zod";
import {
  mongoIdSchema,
  noteContentSchema,
  noteTitleSchema,
  isoDateStringSchema,
} from "../../types/primitives";

export const noteResponseSchema = z.object({
  id: mongoIdSchema,
  title: noteTitleSchema,
  content: noteContentSchema,
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
});
export type NoteResponse = z.infer<typeof noteResponseSchema>;
