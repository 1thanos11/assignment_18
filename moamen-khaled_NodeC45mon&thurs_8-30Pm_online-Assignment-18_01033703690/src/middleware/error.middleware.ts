import type { NextFunction, Request, Response } from "express";

interface IError extends Error {
  statusCode: number;
}

export const GlobalErrorHandler = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(error.statusCode || 500).json({
    msg: error.message || "internal server error",
    stack: error.stack,
    cause: error.cause,
    error,
  });
};
