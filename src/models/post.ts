import Joi, { ref } from "joi";
import mongoose from "mongoose";
import User from "./user.js";

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: User },
  title: { type: String, required: true },
  body: { type: String, required: true },
});
const PostJoiSchema = Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
});
export function validatePost(post: unknown) {
  return PostJoiSchema.validate(post);
}
const PostUpdateJoiSchema = Joi.object({
  userId: Joi.string().optional(),
  title: Joi.string().optional(),
  body: Joi.string().optional(),
});
export function validateUpdatePost(post: unknown) {
  return PostUpdateJoiSchema.validate(post);
}

export type PostSchemaType = mongoose.InferSchemaType<typeof PostSchema>;

export interface IPostSchema extends mongoose.Document, PostSchemaType {}

export const Post = mongoose.model<IPostSchema>("Post", PostSchema);
