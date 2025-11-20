import z from "zod";
import { mongoIdSchema, noteContentSchema, noteTitleSchema } from "../../types/primitives";
import { noteResponseSchema } from "./shared.contract";

export const noteIdInParamsSchema = z.object({
  id: mongoIdSchema,
});
export type NoteIdInParams = z.infer<typeof noteIdInParamsSchema>;

export const noteIdPatchRequestSchema = z
  .object({
    title: noteTitleSchema.trim().optional(),
    content: noteContentSchema.trim().optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "Title or content required",
  });
export type NoteIdPatchRequest = z.infer<typeof noteIdPatchRequestSchema>;

export const noteIdPatchResponseSchema = noteResponseSchema;
export type NoteIdPatchResponse = z.infer<typeof noteIdPatchResponseSchema>;

export const noteIdDeleteResponseSchema = z.object({
  message: z.string().min(1),
});
