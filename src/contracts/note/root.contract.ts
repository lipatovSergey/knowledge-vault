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

export const noteRootGetResponseSchema = z.array(noteResponseSchema);
export type NoteRootGetResponse = z.infer<typeof noteRootGetResponseSchema>;
