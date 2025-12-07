import z from "zod";
import { mongoIdSchema, noteContentSchema, noteTitleSchema } from "../../types/primitives";
import { noteResponseSchema, noteTagsArraySchema } from "./shared.contract";

export const noteIdInParamsSchema = z.object({
  id: mongoIdSchema,
});
export type NoteIdInParams = z.infer<typeof noteIdInParamsSchema>;

export const noteIdGetResponseSchema = noteResponseSchema;
export type NoteIdGetResponse = z.infer<typeof noteIdGetResponseSchema>;

export const noteIdPatchRequestSchema = z
  .object({
    title: noteTitleSchema.trim().optional(),
    content: noteContentSchema.trim().optional(),
    tags: noteTagsArraySchema.optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.content !== undefined || data.tags !== undefined,
    {
      message: "Title or content required",
    },
  );
export type NoteIdPatchRequest = z.infer<typeof noteIdPatchRequestSchema>;

export const noteIdPatchResponseSchema = noteResponseSchema;
export type NoteIdPatchResponse = z.infer<typeof noteIdPatchResponseSchema>;

export const noteIdDeleteResponseSchema = z.object({
  message: z.string().min(1),
});
