import express, { Request, Response, Router, NextFunction } from "express";
import User, { validateSignupUser } from "../models/user.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { AppError } from "../utils/errors.js";
import _ from "lodash";

const app: Router = express.Router();

app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const { error } = validateSignupUser(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }

    // Check if user already exists

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(new AppError("User already exists", 409));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      ..._.pick(req.body, ["name", "email"]),
      password: hashedPassword,
    });

    const newUser = await user.save();
    const token = newUser.getJsonWebToken();
    res.header("x-auth-token", token).status(201).json({ token: token });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export default app;
