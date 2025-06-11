import mongoose from "mongoose";
import { z } from "../lib/zod.js";
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
export interface PostDoc
  extends mongoose.InferSchemaType<typeof PostMongooseSchema> {}
export const PostModel = mongoose.model<PostDoc>("Post", PostMongooseSchema);