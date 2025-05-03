import express, { Request, Response, Router, NextFunction } from "express";
import User, { validateUser } from "../models/user.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { AppError } from "../utils/errors.js";
import _ from "lodash";
const app: Router = express.Router();

app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const { error } = validateUser(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }

    // Check if user already exists

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(new AppError("User already exists", 409));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      ..._.pick(req.body, ["name", "email"]),
      password: hashedPassword,
    });

    const newUser = await user.save();

    // Use lodash pick to select specific fields
    const userResponse = _.pick(newUser, ["name", "email", "_id"]);
    res.status(201).json(userResponse);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

export default app;
