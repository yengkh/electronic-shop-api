import dotenv from "dotenv";
dotenv.config();

import { RateLimitConfig } from "@/types/rateLinit.interface";

export const getRateLimitConfig = (): RateLimitConfig => {
  const max = process.env.MAX_REQUEST_RATE_LIMIT
    ? parseInt(process.env.MAX_REQUEST_RATE_LIMIT, 10)
    : 100;

  if (isNaN(max)) {
    throw new Error("MAXREQUESTRATELIMIT must be a number");
  }

  return {
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later",
  };
};
