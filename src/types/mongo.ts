import { Types, FlattenMaps } from "mongoose";

export type MongoId = string;

export type WithId<T> = FlattenMaps<T> & { _id: Types.ObjectId };
