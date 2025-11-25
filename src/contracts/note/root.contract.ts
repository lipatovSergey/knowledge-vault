import z from "zod";
import { noteContentSchema, noteTitleSchema } from "../../types/primitives";
import { noteResponseSchema } from "./shared.contract";

export const noteRootPostRequestSchema = z.object({
  title: noteTitleSchema.trim(),
  content: noteContentSchema.trim(),
});
export type NoteRootPostRequest = z.infer<typeof noteRootPostRequestSchema>;

export const noteRootPostResponseSchema = noteResponseSchema;
export type NoteRootPostResponse = z.infer<typeof noteRootPostResponseSchema>;

const allowedFields = ["title", "content", "updatedAt"] as const;
function normalizeFields<Allowed extends readonly string[]>(
  raw: string | string[] | undefined,
  allowedFields: Allowed,
): Allowed[number][] | undefined {
  if (raw === undefined) return undefined;
  const values = Array.isArray(raw) ? raw : raw.split(",");
  const normalized = values
    .map((v) => v.trim())
    .filter((v): v is Allowed[number] => allowedFields.includes(v as Allowed[number]));
  return Array.from(new Set(normalized));
}
export const noteRootGetRequestQuerySchema = z.object({
  fields: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((raw) => normalizeFields(raw, allowedFields)),
});

export const noteRootGetResponseSchema = z.array(noteResponseSchema);
export type NoteRootGetResponse = z.infer<typeof noteRootGetResponseSchema>;
