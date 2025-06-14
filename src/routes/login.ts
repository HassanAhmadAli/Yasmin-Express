import express, { Request, Response, Router, NextFunction } from "express";
import {
  UserModel,
  LoginUserInputSchema,
  comparePasswordWithHash,
} from "../models/user.js";

import csurf from "csurf";
import { env } from "../utils/env.js";
import { AppError } from "../utils/errors.js";
import _ from "lodash";
const authRoutes = express.Router();
const csrf = csurf({
  ignoreMethods: ["POST"],
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  },
});
authRoutes.use(csrf);
authRoutes.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const invalidLoginMessage = "Invalid Email Or Password";
    const data = LoginUserInputSchema.parse(req.body);
    const user = await UserModel.findOne({ email: data.email });
    if (!user) {
      return next(new AppError(invalidLoginMessage, 409));
    }
    const validPassword = await comparePasswordWithHash(
      data.password,
      user.password
    );
    if (!validPassword) {
      return next(new AppError(invalidLoginMessage, 409));
    }
    const token = user.getJsonWebToken();
    res.status(200).json({
      token: token, csrfToken: req.csrfToken(), user: _.pick(user, ["name", "email", "_id"])
    });
  }
);

export default authRoutes;
