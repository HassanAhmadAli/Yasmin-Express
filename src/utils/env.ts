import dotenv from "dotenv";
dotenv.config({});
import { z } from "../lib/zod.js";
import { prettifyError } from "zod/v4";
const envSchema = z
  .object({
    MONGODB_URI: z.string(),
    jwtPrivateKey: z.string(),
    PORT: z.string(),
    NODE_ENV: z.enum(["production", "development"]),
  })
  .loose();

const { success, error, data } = envSchema.safeParse(process.env);
if (!success) {
  throw new Error(`Invalid environment variables:\n${prettifyError(error)}`);
}

export const env = data;
