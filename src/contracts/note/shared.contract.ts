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
export type NoteContract = z.infer<typeof noteResponseSchema>;

export const noteListItemResponseSchema = z.object({
  id: mongoIdSchema,
  title: noteTitleSchema,
  content: noteContentSchema.optional(),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
});
export type NoteListItemContract = z.infer<typeof noteListItemResponseSchema>;

export type NoteResponse = z.infer<typeof noteResponseSchema>;
