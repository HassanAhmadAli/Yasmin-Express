import mongoose from "mongoose";
import Joi from "joi";

const JoiPasswordComplexity: any = await import("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 5, maxLength: 50 },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    maxLength: 255,
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const schema = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  email: Joi.string().min(5).max(255).email().required(),
  password: JoiPasswordComplexity({
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  }).required(),
  createdAt: Joi.date().optional(),
});

export const validateUser = (user: any) => {
  return schema.validate(user);
};

export default mongoose.model("User", userSchema);
