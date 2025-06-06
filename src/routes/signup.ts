import express, { Request, Response, Router, NextFunction } from "express";
import { UserModel, UserInputSchema, hashPassword } from "../models/user.js";
import mongoose from "mongoose";
import { AppError } from "../utils/errors.js";
import _ from "lodash";

const app: Router = express.Router();

app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, success, data } = UserInputSchema.safeParse(req.body);
    if (!success) {
      return next(AppError.fromZodError(error, 400));
    }
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      return next(new AppError("User already exists", 409));
    }
    const user = new UserModel({
      ..._.omit(data, ["password"]),
      password: await hashPassword(data.password),
    });
    const newUser = await user.save();
    const token = newUser.getJsonWebToken();
    res.header("x-auth-token", token).status(201).json({ token: token });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export default app;
