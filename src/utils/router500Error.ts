// utils/errorHandler.ts
import { ErrorResponseOptions } from "@/types/errorResponeOptions.interface";
import { Response } from "express";

export const handleHttpError = (
  error: unknown,
  res: Response,
  options: ErrorResponseOptions = {}
) => {
  const statusCode = options.statusCode || 500;
  const errorMessage =
    error instanceof Error ? error.message : "Internal Server Error";

  res.status(statusCode).json({
    error: options.exposeDetails ? errorMessage : undefined,
    message: statusCode === 500 ? "Internal Server Error" : "Request Failed",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};
