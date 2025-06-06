import mongoose from "mongoose";
import { z } from "zod/v4";
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
