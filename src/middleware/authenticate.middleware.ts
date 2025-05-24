import { sendError } from "@/utils/apiRespone";
import { handleHttpError } from "@/utils/router500Error";
import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isDevelopment = process.env.NODE_ENV === "development";
export const authenticate = (role: "admin" | "customer") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      sendError({
        res,
        status: 401,
        message: "Unauthorize!",
        code: "AUTH_REQUIRED",
        details: ["unauthorized"],
      });

      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as any;

      if (!role.includes(decoded.role)) {
        sendError({
          res,
          status: 403,
          message: "Access Denied!",
          code: "FORBIDDEN",
          details: ["permissions"],
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      handleHttpError(error, res, {
        statusCode: 500,
        exposeDetails: isDevelopment,
      });
    }
  };
};
