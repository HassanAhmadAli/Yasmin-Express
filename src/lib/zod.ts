import { z, ZodError, prettifyError } from "zod/v4";
z.config(z.locales.en());
const zodWebsiteValidator = z
  .string()
  .regex(
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/,
    "invalid Url"
  );
export { z, ZodError, prettifyError, zodWebsiteValidator };
