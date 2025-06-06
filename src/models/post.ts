import mongoose from "mongoose";
import { z } from "zod/v4";
import { CustomerModel } from "./customer.js";
const PostMongooseSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: CustomerModel,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
});
export const PostInputSchema = z.object({
  customer: z.string(),
  title: z.string(),
  body: z.string(),
});
export const PostBulkInputSchema = z.array(PostInputSchema);
export interface PostDoc
  extends mongoose.InferSchemaType<typeof PostMongooseSchema> {}
export const PostModel = mongoose.model<PostDoc>("Post", PostMongooseSchema);