import { z, ZodError, prettifyError } from "zod/v4";
z.config(z.locales.en());
const zodWebsiteValidator = z
  .string()
  .regex(
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/,
    "invalid Url"
  );

const zodStringToInteger = z.string().transform((arg) => {
  const res = Number.parseInt(arg);
  if (Number.isNaN(res)) throw new Error("expected a number");
  return res;
});
export { z, ZodError, prettifyError, zodWebsiteValidator, zodStringToInteger };
