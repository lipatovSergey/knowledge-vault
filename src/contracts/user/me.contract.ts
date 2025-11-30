import { z } from "zod";
import { emailSchema, isoDateStringSchema, mongoIdSchema } from "../../types/primitives";

export const userMePatchRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined));
export type UserMePatchRequest = z.infer<typeof userMePatchRequestSchema>;

export const userProfileResponseSchema = z
  .object({
    id: mongoIdSchema,
    name: z.string().min(1),
    email: emailSchema,
    createdAt: isoDateStringSchema,
    updatedAt: isoDateStringSchema,
  })
  .strict();
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;

export const userMeGetResponseSchema = userProfileResponseSchema;
export type UserMeGetResponse = z.infer<typeof userMeGetResponseSchema>;

export const userMePatchResponseSchema = userProfileResponseSchema;
export type UserMePatchResponse = z.infer<typeof userMePatchResponseSchema>;

export const userMeDeleteResponseSchema = z.object({
  message: z.string().min(1),
});
export type UserMeDeleteResponse = z.infer<typeof userMeDeleteResponseSchema>;
