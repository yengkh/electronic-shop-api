import { ErrorResponse, SuccessResponse } from "@/types/apiRespone.interface";
import { Response } from "express";

export function sendSuccess<T>(params: SuccessResponse<T>): Response {
  const { res, status = 200, message, data } = params;

  const isDevelopment = process.env.NODE_ENV === "development";

  return res.status(status).json({
    success: true,
    message: isDevelopment ? message : "Request success!",
    timestamp: new Date().toISOString(),
    data,
  });
}

export function sendError(params: ErrorResponse): Response {
  const { res, status = 400, message, code, details = [] } = params;

  const isDevelopment = process.env.NODE_ENV === "development";

  return res.status(status).json({
    success: false,
    message: isDevelopment ? message : "Request failed!",
    timestamp: new Date().toISOString(),
    ...(isDevelopment && {
      error: { code, details },
      stack: isDevelopment ? new Error().stack : undefined,
    }),
  });
}
