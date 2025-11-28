import z, { number, ZodError } from "zod";
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
  // in case if fields wasn't passed at all
  if (raw === undefined) return undefined;
  const values = Array.isArray(raw) ? raw : raw.split(",");
  const allowedSet = new Set(allowedFields);
  const isAllowed = (v: string): v is (typeof allowedFields)[number] =>
    allowedSet.has(v as (typeof allowedFields)[number]);
  const normalized = Array.from(new Set(values.map((v) => v.trim()).filter(isAllowed)));
  return normalized;
}
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

export const noteRootGetResponseSchema = z.array(noteResponseSchema);
export type NoteRootGetResponse = z.infer<typeof noteRootGetResponseSchema>;
