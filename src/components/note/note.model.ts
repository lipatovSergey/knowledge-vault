import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export type NoteSchemaType = InferSchemaType<typeof noteSchema>;
export type NoteDocument = HydratedDocument<NoteSchemaType>;
export const NoteModel = model<NoteSchemaType>("Note", noteSchema);
export { noteSchema };
