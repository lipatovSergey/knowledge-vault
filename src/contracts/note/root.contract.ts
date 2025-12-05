import z from "zod";
import { noteContentSchema, noteTitleSchema, tagSchema } from "../../types/primitives";
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
  page: z.coerce.number().int().min(1, "Page value must be at least 1 symbol").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit value must be at least 1 symbol")
    .max(100, "Limit value must be at most 100 symbols")
    .default(20),
  search: z
    .string()
    .trim()
    .max(120, "Search string must be at most 120 symbols")
    .optional()
    .transform((s) => (s && s.length > 0 ? s.toLowerCase() : undefined)),
  tags: z.preprocess(
    (raw) => {
      if (raw === undefined) return undefined;
      const values = Array.isArray(raw) ? raw : String(raw).split(",");
      const normalized = values.map((v) => v.trim().toLowerCase());
      return Array.from(new Set(normalized));
    },
    z
      .array(tagSchema)
      .optional()
      .refine((v) => !v || v.length <= 100, {
        message: "Tags must be at most 100",
        path: ["tags"],
      }),
  ),
});
export type NoteRootGetRequestQuery = z.infer<typeof noteRootGetRequestQuerySchema>;

export const noteRootGetResponseSchema = z.object({
  data: z.array(noteListItemResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export type NoteRootGetResponse = z.infer<typeof noteRootGetResponseSchema>;
