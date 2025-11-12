import z from "zod";

export const authLogoutResponseSchema = z.object({
  message: z.string().min(1),
});
