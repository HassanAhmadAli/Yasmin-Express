import mongoose from "mongoose";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod/v4";
import { addressInputSchema, addressMongooseSchema } from "./address.js";
import { companyInputSchema, companyMongooseSchema } from "./company.js";
export const customerMongooseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: addressMongooseSchema, required: true },
  phone: {
    type: String,
    required: true,
  },
  website: { type: String, required: true },
  company: { type: companyMongooseSchema, required: true },
});
export const CustomerInputSchema = z.object({
  name: z.string().trim().nonempty(),
  username: z.string(),
  email: z.email(),
  address: addressInputSchema,
  phone: z.string().transform((phone) => {
    const phoneNumber = parsePhoneNumberFromString(phone, "US");
    if (!phoneNumber) {
      throw new Error("Invalid phone number");
    }
    return phoneNumber.format("E.164");
  }),
  website: z.url(),
  company: companyInputSchema,
});
export const CustomerBulkInputSchema = z.array(CustomerInputSchema);
export const CustomerModel = mongoose.model("customer", customerMongooseSchema);
