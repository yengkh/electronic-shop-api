import { Request, Response } from "express";
import Users from "../models/user.model";
import mongoose from "mongoose";
import { handleHttpError } from "../utils/router500Error";
import { sendError, sendSuccess } from "../utils/apiRespone";

const UserModel = Users(mongoose);
const isDevelopment = process.env.NODE_ENV === "development";

// Get Current user
export const getCurrentUserhandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    console.log("Current user infor ", user);

    sendSuccess({
      res,
      status: 200,
      message: "Current user fetch successfully!",
      data: user,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Get all use handler
export const getAllUsersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await UserModel.find({}).select("-password").lean();
    if (!users) {
      sendError({
        res,
        status: 404,
        message: "Users not found!",
        code: "NOT_FOUND",
      });

      return;
    }

    sendSuccess({
      res,
      status: 200,
      message: "Users fetch successfully!",
      data: users,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Get user by ID
export const getUserByIDHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      sendError({
        res,
        status: 400,
        message: "User ID is required!",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    if (!mongoose.isValidObjectId(userId)) {
      sendError({
        res,
        status: 400,
        message: "User ID is not valid!",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      sendError({
        res,
        status: 404,
        message: "Can not find user!",
        code: "NOT_FOUND",
      });

      return;
    }

    sendSuccess({
      res,
      status: 200,
      message: "User information fetch by ID successfully!",
      data: user,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};
