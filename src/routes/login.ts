import express, { Request, Response, Router, NextFunction } from "express";
import { UserModel, LoginUserInputSchema } from "../models/user.js";

import bcrypt from "bcrypt";
import { AppError } from "../utils/errors.js";
import _ from "lodash";

import csurf from "csurf";
const authRoutes = express.Router();
const csrf = csurf({
  ignoreMethods: ["POST"],
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
      const { error, data, success } = LoginUserInputSchema.safeParse(req.body);
      if (!success) {
        return next(AppError.fromZodError(error, 400));
      }
      const existingUser = await UserModel.findOne({ email: data.email });
      if (!existingUser) {
        return next(new AppError(invalidLoginMessage, 409));
      }
      const validPassword = await bcrypt.compare(
        data.password,
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
