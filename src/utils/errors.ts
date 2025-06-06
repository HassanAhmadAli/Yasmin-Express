import { z, ZodError } from "zod/v4";

export class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
  static fromZodError = (error: ZodError, statusCode: number): AppError => {
    return new AppError(z.prettifyError(error), statusCode);
  };
}
