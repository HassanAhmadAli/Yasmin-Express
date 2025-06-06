import mongoose from "mongoose";
import { z } from "../lib/zod.js";

export const geoMongooseSchema = new mongoose.Schema({
  lat: { type: String, required: true },
  lng: { type: String, required: true },
});
export const geoInputSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});
