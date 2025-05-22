import mongoose, { InferSchemaType } from "mongoose";
import Joi from "joi";
import password_validator from "../utils/password_validator.js";
import env from "../utils/env.js";
import jsonwebtoken from "jsonwebtoken";
import _ from "lodash";

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

type UserSchemaType = InferSchemaType<typeof userSchema>;
export interface IUser extends mongoose.Document, UserSchemaType {
  getJsonWebToken: () => string;
}

userSchema.methods.getJsonWebToken = function (): string {
  const payLoad = _.pick(this, ["_id"]);
  const jwt_secret: any = env.jwtPrivateKey;
  const token = jsonwebtoken.sign(_.pick(this, "_id"), jwt_secret);
  return token;
};

const User = mongoose.model<IUser>("User", userSchema);
////
const loginUserSchema = Joi.object({
  email: Joi.string().min(5).max(255).email().required(),
  password: password_validator,
  createdAt: Joi.date().optional(),
});

export const validateLoginUser = (user: any) => {
  return loginUserSchema.validate(user);
};
////
const signupUserSchema = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  email: Joi.string().min(5).max(255).email().required(),
  password: password_validator,
  createdAt: Joi.date().optional(),
});

export const validateSignupUser = (user: any) => {
  return signupUserSchema.validate(user);
};

export default User;
