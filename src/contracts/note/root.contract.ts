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

const allowedFields = ["content", "tags", "title", "updatedAt", "createdAt"] as const;
export type AllowedNoteFields = (typeof allowedFields)[number];
export const noteRootGetRequestQuerySchema = z.object({
  fields: z
    .union([z.string(), z.array(z.string())])
    .default(["title", "updatedAt"])
    .transform((raw) => normalizeFields(raw, allowedFields))
    // in case that no allowed fields were passed into fields
    .refine((v) => v.length > 0, {
      message: "Invalid fields",
      path: ["fields"],
    }),
  page: z.coerce.number().int().min(1, "Minimum value for page is 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Minimum value for limit is 1")
    .max(100, "Maximum value for limit is 100")
    .default(20),
});
export type NoteRootGetRequestQuery = z.infer<typeof noteRootGetRequestQuerySchema>;

export const noteRootGetResponseSchema = z.object({
  data: z.array(noteListItemResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export type NoteRootGetResponse = z.infer<typeof noteRootGetResponseSchema>;
