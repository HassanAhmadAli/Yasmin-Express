import express, { Request, Response, Router, NextFunction } from "express";
import User from "../models/user.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { AppError } from "../utils/errors.js";
import _ from "lodash";
import Joi from "joi";
import password_validator from "../utils/password_validator.js";
import jsonwebtoken from "jsonwebtoken";
import env from "../utils/env.js";
import csurf from "csurf";
const authRoutes = express.Router();

const csrf = csurf({
  ignoreMethods: ["POST"],
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});
const schema = Joi.object({
  email: Joi.string().min(5).max(255).email().required(),
  password: password_validator,
  createdAt: Joi.date().optional(),
  name: Joi.string().min(5).max(50).required(),
});

export const validate = (user: any) => {
  return schema.validate(user);
};
authRoutes.use(csrf);
authRoutes.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const invalidLoginMessage = "Invalid Email Or Password";
    try {
      // Validate input
      const { error } = validate(req.body);
      if (error) {
        return next(new AppError(error.message, 400));
      }

      // Check if user already exists

      const existingUser = await User.findOne({ email: req.body.email });
      if (!existingUser) {
        return next(new AppError(invalidLoginMessage, 409));
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        existingUser.password
      );
      if (!validPassword) {
        return next(new AppError(invalidLoginMessage, 409));
      }
      const token = existingUser.getJsonWebToken();
      res.status(200).json({ token: token, csrfToken: req.csrfToken() });
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

export default authRoutes;
