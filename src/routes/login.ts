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
import { validateLoginUser } from "../models/user.js";
const authRoutes = express.Router();
const csrf = csurf({
  ignoreMethods: ["POST", "OPTIONS"],
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});
authRoutes.use(csrf);
authRoutes.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const invalidLoginMessage = "Invalid Email Or Password";
    try {
      // Validate input
      const { error } = validateLoginUser(req.body);
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
