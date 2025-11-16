import { z } from "zod";

export const problemSchema = z.object({
  title: z.string(),
  detail: z.string(),
  status: z.number().int(),
  type: z.string(),
  instance: z.string(),
});

export const validationErrorSchema = problemSchema.extend({
  title: z.literal("Validation failed"),
  status: z.literal(422),
  type: z.literal("urn:problem:validation-error"),
  errors: z.object({
    source: z.enum(["body", "query", "params", "headers"]),
    fieldErrors: z.record(z.string(), z.array(z.string())),
    formErrors: z.array(z.string()),
  }),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;

export const conflictErrorSchema = problemSchema.extend({
  title: z.literal("Conflict"),
  status: z.literal(409),
  type: z.literal("urn:problem:conflict"),
});

export const unauthorizedErrorSchema = problemSchema.extend({
  title: z.literal("Unauthorized"),
  status: z.literal(401),
  type: z.literal("urn:problem:unauthorized"),
});

export const notFoundErrorSchema = problemSchema.extend({
  title: z.literal("Not found"),
  status: z.literal(404),
  type: z.literal("urn:problem:not-found"),
});

export const badRequestErrorSchema = problemSchema.extend({
  title: z.literal("Bad Request"),
  status: z.literal(400),
  type: z.literal("urn:problem:bad-request"),
});
