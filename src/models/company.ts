import mongoose from "mongoose";
import { z } from "../lib/zod.js";
export const companyMongooseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  catchPhrase: { type: String, required: true },
  bs: { type: String, required: true },
});
export const companyInputSchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});
