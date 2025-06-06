import mongoose from "mongoose";
import { z } from "zod/v4";

export const geoMongooseSchema = new mongoose.Schema({
  lat: { type: String, required: true },
  lng: { type: String, required: true },
});
export const geoInputSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});
