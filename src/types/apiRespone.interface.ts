import { Response } from "express";

export interface SuccessResponse<T> {
  res: Response;
  status?: number;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  res: Response;
  status?: number;
  message: string;
  code: string;
  details?: any[];
}
