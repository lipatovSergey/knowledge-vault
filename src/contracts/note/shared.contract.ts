import z from "zod";
import {
  mongoIdSchema,
  noteContentSchema,
  noteTitleSchema,
  isoDateStringSchema,
  tagSchema,
} from "../../types/primitives";

export const noteTagsArraySchema = z
  .array(tagSchema)
  .transform((arr) => Array.from(new Set(arr)))
  .refine((arr) => arr.length <= 20, { message: "A maximum of 20 unique tags is allowed" });
export type NoteTagsArray = z.infer<typeof noteTagsArraySchema>;

export const noteResponseSchema = z
  .object({
    id: mongoIdSchema,
    title: noteTitleSchema,
    content: noteContentSchema,
    tags: noteTagsArraySchema,
    createdAt: isoDateStringSchema,
    updatedAt: isoDateStringSchema,
  })
  .strict();
export type NoteContract = z.infer<typeof noteResponseSchema>;

export const noteListItemResponseSchema = z
  .object({
    id: mongoIdSchema,
    title: noteTitleSchema.optional(),
    content: noteContentSchema.optional(),
    tags: noteTagsArraySchema.optional(),
    createdAt: isoDateStringSchema.optional(),
    updatedAt: isoDateStringSchema.optional(),
  })
  .strict();
export type NoteListItemContract = z.infer<typeof noteListItemResponseSchema>;
