import { Request, Response } from "express";
import Users from "../models/user.model";
import mongoose from "mongoose";
import { handleHttpError } from "../utils/router500Error";
import { sendError, sendSuccess } from "../utils/apiRespone";
import { removeUserAvatar } from "../utils/removeUserAvatar.util";
const UserModel = Users(mongoose);
const isDevelopment = process.env.NODE_ENV === "development";
const FILE_DOMAIN = process.env.FILE_DOMAIN;
const SUP_DOMAIN_IMAGE_PATH_USER_AVATAR =
  process.env.SUP_DOMAIN_IMAGE_PATH_USER_AVATAR;

// Get Current user
export const getCurrentUserhandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

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

// Update user infor
export const updateUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    let { name, email, phone, role } = req.body;
    if (!mongoose.isValidObjectId(userId)) {
      sendError({
        res,
        status: 400,
        message: "User ID is invalid!",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const findUser = await UserModel.findById(userId).select("-password");
    if (!findUser) {
      sendError({
        res,
        status: 404,
        message: "User not found!",
        code: "NOT_FOUND",
      });

      return;
    }

    const checkUser = await UserModel.findOne({
      $or: [{ email, phone }],
      _id: { $ne: userId },
    });
    if (checkUser) {
      sendError({
        res,
        status: 400,
        message: "User already exist!",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    if (name) findUser.name = name;
    if (email) findUser.email = email;
    if (phone) findUser.phone = phone;
    if (role) findUser.role = role;

    if (name && findUser.avatar) {
      findUser.avatar.altText = name.trim();
    }
    await findUser.save();

    sendSuccess({
      res,
      status: 200,
      message: "User updated successfully!",
      data: findUser,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Update user profile image
export const updateUserProfileImageHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      sendError({
        res,
        status: 400,
        message: "User ID is invalid!",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const user = await UserModel.findById(userId).select("avatar");
    if (!user) {
      sendError({
        res,
        status: 404,
        message: "User not found!",
        code: "NOT_FOUND",
      });

      return;
    }

    if (!req.file) {
      sendError({
        res,
        status: 400,
        message: "Profile image is required!",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    if (user.avatar.url) {
      removeUserAvatar(user.avatar.url);
    }

    const newUserAvatar = {
      url: `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_USER_AVATAR}${req.file.filename}`,
      altText: user.avatar.altText,
    };

    user.avatar = newUserAvatar;
    await user.save();
    sendSuccess({
      res,
      status: 200,
      message: "User profile image updated successfully!",
      data: user,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Delete user handler
export const deleteUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      sendError({
        res,
        status: 400,
        message: "User ID is invalid!",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      sendError({
        res,
        status: 404,
        message: "User not found!",
        code: "NOT_FOUND",
      });

      return;
    }

    sendSuccess({
      res,
      status: 200,
      message: "User deleted successfully!",
      data: user,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};
