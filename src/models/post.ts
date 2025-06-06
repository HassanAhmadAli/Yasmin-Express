import Joi, { ref } from "joi";
import mongoose from "mongoose";
import Customer from "./customer.js";
import { z } from "zod/v4";
const PostMongooseSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Customer,
  },

  title: { type: String, required: true },
  body: { type: String, required: true },
});
export const PostInputSchema = z.object({
  customer: z.string(),
  title: z.string(),
  body: z.string(),
});
export const BulkPostInputSchema = z.array(PostInputSchema);

export interface PostDoc
  extends mongoose.InferSchemaType<typeof PostMongooseSchema> {}

export const PostModel = mongoose.model<PostDoc>("Post", PostMongooseSchema);
