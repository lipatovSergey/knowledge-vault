import z from "zod";
import { Types, FlattenMaps } from "mongoose";

export const emailSchema = z.email();
export type Email = z.infer<typeof emailSchema>;

export const mongoIdSchema = z
  .string()
  .length(24, "Invalid ObjectId")
  .regex(/^[0-9a-fA-F]+$/, "ObjectId type invalid");
export type MongoId = z.infer<typeof mongoIdSchema>;

export const passwordPlainSchema = z.string().min(6);
export type PasswordPlain = z.infer<typeof passwordPlainSchema>;

export const isoDateStringSchema = z.iso.datetime();
export type IsoDate = z.infer<typeof isoDateStringSchema>;

export const passwordResetSelectorSchema = z
  .string()
  .length(22)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid selector");
export type PasswordResetSelector = z.infer<typeof passwordResetSelectorSchema>;

export const passwordResetValidatorSchema = z
  .string()
  .length(43)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid validator");
export type PasswordResetValidator = z.infer<typeof passwordResetValidatorSchema>;

export const passwordResetTokenDomainSchema = z.object({
  selector: passwordResetSelectorSchema,
  validator: passwordResetValidatorSchema,
});
export type PasswordResetTokenDomain = z.infer<typeof passwordResetTokenDomainSchema>;

export const passwordResetTokenStringSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/, "Invalid reset token");
export type PasswordResetTokenString = z.infer<typeof passwordResetTokenStringSchema>;

export type WithId<T> = FlattenMaps<T> & { _id: Types.ObjectId };

export const noteTitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(120, "Title max length 120 symbols");
export type NoteTitle = z.infer<typeof noteTitleSchema>;

export const noteContentSchema = z
  .string()
  .min(1, "Content is required")
  .max(2000, "Content max length 2000 symbols");
export type NoteContent = z.infer<typeof noteContentSchema>;
