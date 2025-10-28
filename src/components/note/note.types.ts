import { MongoId } from "../../types/mongo";

export type CreateNoteParams = {
  title: string;
  content: string;
  userId: MongoId;
};

export type UpdateNotePayload = {
  title?: string;
  content?: string;
};
