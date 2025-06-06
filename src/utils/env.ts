import dotenv from "dotenv";
dotenv.config({});
import { z } from "../lib/zod.js";
import { prettifyError } from "zod/v4";
const envSchema = z.object({
  MONGODB_URI: z.string(),
  jwtPrivateKey: z.string(),
  PORT: z.string(),
  NODE_ENV: z.string(),
});
const { success, error, data } = envSchema.safeParse(process.env);
if (!success) {
  throw new Error(`Invalid environment variables:\n${prettifyError(error)}`);
}
export const { MONGODB_URI, jwtPrivateKey, PORT, NODE_ENV } = data;

export default process.env;
