import mongoose, { InferSchemaType } from "mongoose";
import env from "../utils/env.js";
import jsonwebtoken from "jsonwebtoken";
import _ from "lodash";
import { z } from "zod/v4";
import bcrypt from "bcrypt";
const UserMongooseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);
export interface UserDoc extends InferSchemaType<typeof UserMongooseSchema> {
  getJsonWebToken: () => string;
}

UserMongooseSchema.methods.getJsonWebToken = function (): string {
  const payLoad = _.pick(this, ["_id"]);
  const jwt_secret: any = env.jwtPrivateKey;
  const token = jsonwebtoken.sign(_.pick(this, "_id"), jwt_secret);
  return token;
};
export const UserModel = mongoose.model<UserDoc>("User", UserMongooseSchema);

export const UserInputSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
});
export const LoginUserInputSchema = UserInputSchema.pick({
  email: true,
  password: true,
});
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
