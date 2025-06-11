import dotenv from "dotenv";
dotenv.config({});
import { z, prettifyError } from "../lib/zod.js";
const envSchema = z
  .object({
    MONGODB_URI: z.string().default("mongodb://localhost:27017"),
    jwtPrivateKey: z
      .string()
      .default(
        "SECRET=_______THIS_SHOULD_NEVER_BE_NULL_IN_REAL_APPLICATION_UNDER_ANY_CIRCUMSTANCE__________"
      ),
    PORT: z.string().default("3009"),
    NODE_ENV: z.enum(["production", "development"]).default("production"),
    email: z.email().or(z.literal("")).default(""),
    emailpassword: z.string().or(z.literal("")).default(""),
  })
  .loose();

const { success, error, data } = envSchema.safeParse(process.env);

if (!success || data == undefined) {
  throw new Error(`Invalid environment variables:\n${prettifyError(error)}`);
}

export const env = data;
