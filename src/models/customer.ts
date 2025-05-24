import mongoose from "mongoose";
import Joi from "joi";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Geo Schema
const geoSchema = new mongoose.Schema({
  lat: { type: String, required: true },
  lng: { type: String, required: true },
});

// Address Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  suite: { type: String, required: true },
  city: { type: String, required: true },
  zipcode: { type: String, required: true },
  geo: { type: geoSchema, required: true },
});

// Company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  catchPhrase: { type: String, required: true },
  bs: { type: String, required: true },
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: addressSchema, required: true },
  phone: {
    type: String,
    required: true,
    set: (phone: string) => {
      try {
        const phoneNumber = parsePhoneNumberFromString(phone, "US");
        if (!phoneNumber) {
          throw new Error("Invalid phone number");
        }
        return phoneNumber.format("E.164"); // Returns standardized format like +12133734253
      } catch (error) {
        throw new Error("Invalid phone number format");
      }
    },
  },
  website: { type: String, required: true },
  company: { type: companySchema, required: true },
});

// Validation Schema
const geoValidationSchema = Joi.object({
  lat: Joi.string().required(),
  lng: Joi.string().required(),
});

const addressValidationSchema = Joi.object({
  street: Joi.string().required(),
  suite: Joi.string().required(),
  city: Joi.string().required(),
  zipcode: Joi.string().required(),
  geo: geoValidationSchema,
});

const companyValidationSchema = Joi.object({
  name: Joi.string().required(),
  catchPhrase: Joi.string().required(),
  bs: Joi.string().required(),
});

const customerValidationSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  address: addressValidationSchema,
  phone: Joi.string().required(),
  website: Joi.string().required(),
  company: companyValidationSchema,
});

export const validateCustomer = (customer: any) => {
  return customerValidationSchema.validate(customer);
};

const Customer = mongoose.model("customer", customerSchema);
export default Customer;
