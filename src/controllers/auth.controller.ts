import mongoose from "mongoose";
import Users from "../models/user.model";
import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/apiRespone";
import bcrypt from "bcryptjs";
import { handleHttpError } from "../utils/router500Error";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import validator from "validator";
import jwt from "jsonwebtoken";

const isDevelopment = process.env.NODE_ENV === "development";
const UserModel = Users(mongoose);
const FILE_DOMAIN = process.env.FILE_DOMAIN;
const SUP_DOMAIN_IMAGE_PATH_USER_AVATAR =
  process.env.SUP_DOMAIN_IMAGE_PATH_USER_AVATAR;

// Resister new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role } = req.body;

    const errors: string[] = [];

    // Basic validation
    if (!name || !phone || !password) {
      errors.push("All fields are required.");
    }

    if (email && !validator.isEmail(email)) {
      errors.push("Invalid email address.");
    }

    if (phone && !validator.isMobilePhone(phone, "any")) {
      errors.push("Invalid phone number.");
    }

    if (password && !validator.isLength(password, { min: 6 })) {
      errors.push("Password must be at least 6 characters.");
    }

    if (errors.length > 0) {
      sendError({
        res,
        status: 400,
        message: "Validation error",
        code: "VALIDATION_ERROR",
        details: errors,
      });

      return;
    }

    let imageData = {};
    if (req.file) {
      imageData = {
        url: `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_USER_AVATAR}${req.file.filename}`,
        altText: name.trim(),
      };
    }
    // Check if email or phone already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      sendError({
        res,
        status: 400,
        message: "Email or phone already registered.",
        code: "VALIDATION_ERROR",
        details: errors,
      });

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      avatar: imageData,
      isVerified: false,
      role: role ? role : "customer",
    });

    const payload = {
      _id: newUser._id,
      role: newUser.role,
      email: newUser.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    sendSuccess({
      res,
      status: 201,
      message: "User registered successfully!",
      data: {
        user: {
          accessToken,
          refreshToken,
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          avatar: imageData,
          isVerified: false,
        },
      },
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      sendError({
        res,
        status: 400,
        message: "Email or phone and password are required!",
        code: "VALIDATION_ERROR",
        details: [
          !email && !phone
            ? "Please provide either email or phone."
            : undefined,
          !password ? "Please provide password." : undefined,
        ].filter(Boolean),
      });

      return;
    }

    const user = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      sendError({
        res,
        status: 401,
        message: "Invalid credentials",
        code: "AUTH_REQUIRED",
        details: ["unauthorized"],
      });

      return;
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    sendSuccess({
      res,
      status: 200,
      message: "Login successfully!",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Refresh Token
export const refreshTokenHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    sendError({
      res,
      status: 400,
      message: "Refresh Token is required!",
      code: "VALIDATION_ERROR",
    });

    return;
  }
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as any;

    const payload = {
      _id: decoded._id,
      role: decoded.role,
    };

    const newAccessToken = generateAccessToken(payload);

    sendSuccess({
      res,
      status: 200,
      message: "Access token refreshed!",
      data: newAccessToken,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};
