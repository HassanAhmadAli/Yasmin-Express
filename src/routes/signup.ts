import express, { Request, Response, Router, NextFunction } from "express";
import { UserModel, UserInputSchema, hashPassword } from "../models/user.js";
import { AppError } from "../utils/errors.js";
import _ from "lodash";
import mongoose, { MongooseError } from "mongoose";
const app: Router = express.Router();
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const data = UserInputSchema.parse(req.body);
  const user = new UserModel({
    ..._.omit(data, ["password"]),
    password: await hashPassword(data.password),
  });
  try {
    await user.save();
  } catch (error: any) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return next(new AppError("User already exists", 409));
    }
    return next(error);
  }
  const token = user.getJsonWebToken();
  res.header("x-auth-token", token).status(201).json({ token: token });
});
export default app;
