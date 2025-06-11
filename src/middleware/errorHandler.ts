import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { z, prettifyError, ZodError } from "../lib/zod.js";

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: any,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: z.prettifyError(error),
    });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  console.error("Unhandled error:", error);
  return res.status(500).json({
    status: "error",
    message: error.message || "Something went wrong",
  });
};
