import z from "zod";
import { noteContentSchema, noteTitleSchema } from "../../types/primitives";
import {
  noteListItemResponseSchema,
  noteResponseSchema,
  noteTagsArraySchema,
} from "./shared.contract";
import { normalizeFields } from "../../utils/query.util";

export const noteRootPostRequestSchema = z.object({
  title: noteTitleSchema.trim(),
  content: noteContentSchema.trim(),
  tags: noteTagsArraySchema.optional(),
});
export type NoteRootPostRequest = z.infer<typeof noteRootPostRequestSchema>;

export const noteRootPostResponseSchema = noteResponseSchema;
export type NoteRootPostResponse = z.infer<typeof noteRootPostResponseSchema>;

const allowedFields = ["content", "tags"] as const;
export type AllowedNoteFields = (typeof allowedFields)[number];
export const noteRootGetRequestQuerySchema = z.object({
  fields: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((raw) => normalizeFields(raw, allowedFields))
    // in case that no allowed fields were passed into fields
    .refine((v) => v === undefined || v.length > 0, {
      message: "Invalid fields",
      path: ["fields"],
    }),
});
export type NoteRootGetRequestQuery = z.infer<typeof noteRootGetRequestQuerySchema>;

export const noteRootGetResponseSchema = z.array(noteListItemResponseSchema);
export type NoteRootGetResponse = z.infer<typeof noteRootGetResponseSchema>;
