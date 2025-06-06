import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { env } from "../utils/env.js";
import jsonwebtoken from "jsonwebtoken";
import _ from "lodash";
interface AuthRequest extends Request {
  user?: any;
}
const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorizationHeader = req.header("authorization");
  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new AppError("Access Denied. No token provided.", 401));
    return;
  }

  const token = authorizationHeader.split(" ")[1];
  const jwt_secret: any = env.jwtPrivateKey;
  try {
    const decoded = jsonwebtoken.verify(token, jwt_secret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Invalid Token", 400));
  }
};

export default auth;
