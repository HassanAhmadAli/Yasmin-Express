import express, { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: any,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Handle unexpected errors
  console.error("Unhandled error:", err);
  return res.status(500).json({
    status: "error",
    message: err.message || "Something went wrong",
  });
};
