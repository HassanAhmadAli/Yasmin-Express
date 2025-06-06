import mongoose from "mongoose";
import { z } from "../lib/zod.js";
import { geoInputSchema, geoMongooseSchema } from "./geo.js";
export const addressMongooseSchema = new mongoose.Schema({
  street: { type: String, required: true },
  suite: { type: String, required: true },
  city: { type: String, required: true },
  zipcode: { type: String, required: true },
  geo: { type: geoMongooseSchema, required: true },
});
export const addressInputSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: geoInputSchema,
});
