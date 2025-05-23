import { handleHttpError } from "../utils/router500Error";
import Category from "../models/category.model";
import { Request, Response, RequestHandler, NextFunction } from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import { sendError, sendSuccess } from "../utils/apiRespone";

const CategoryModel = Category(mongoose);
const date = new Date().toISOString();

export const createCategoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, isActive = true, description } = req.body;

    // 1. Validation
    if (!name) {
      sendError({
        res,
        status: 400,
        message: "You must enter category name!",
        code: "VALIDATION_ERROR",
        details: ["Invalid request body"],
      });
      return;
    }

    // 2. Auto-generate slug
    const slug = slugify(name.trim(), {
      lower: true,
      strict: true,
      trim: true,
    });

    // 3. Auto-generate path
    const path = `/categories/${slug}`
      .toLowerCase()
      .replace(/\/+/g, "/") // Remove double slash
      .replace(/\/$/, ""); // Remove with end slash

    // 4. Check for existing slug
    const existingCategory = await CategoryModel.findOne({ slug });
    if (existingCategory) {
      sendError({
        res,
        status: 409,
        message: `Category with name ${name} already exist!`,
        code: "CONFLICT",
        details: ["Duplicate category name"],
      });
      return;
    }
    // 5. Create and save category
    const newCategory = new CategoryModel({
      name: name.trim(),
      slug,
      path,
      isActive,
      description,
    });

    await newCategory.save();

    // 6. Return response
    sendSuccess({
      res,
      status: 201,
      message: `Category with name ${name} was created successfully!`,
      data: newCategory,
    });
  } catch (error: unknown) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: process.env.NODE_ENV === "development",
    });
  }
};

// Get all categories
export const getAllCategoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryList = await CategoryModel.find({});

    sendSuccess({
      res,
      status: 200,
      message: "Successfully get all category list!",
      data: categoryList,
    });
  } catch (error: unknown) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: process.env.NODE_ENV === "development",
    });
  }
};

// Get category by slug
export const getCategoryHandlerBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await CategoryModel.findOne({
      slug: req.params.identifier,
    }).lean();
    if (!category) {
      sendSuccess({
        res,
        message: "Successfully get all category list!",
        data: [],
      });
    }

    sendSuccess({
      res,
      message: "Successfully get all category list!",
      data: [],
    });
  } catch (error: unknown) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: process.env.NODE_ENV === "development",
    });
  }
};

// Get category by ID
export const getCategoryHandlerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await CategoryModel.findById(req.params.identifier).lean();
    if (!category) {
      sendError({
        res,
        status: 404,
        message: `Can not find Category`,
        code: "NOT_FOUND",
        details: ["Invalid category ID"],
      });
    }

    sendSuccess({
      res,
      message: "Category retrieved successfully!",
      data: category,
    });
  } catch (error: unknown) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: process.env.NODE_ENV === "development",
    });
  }
};

// Get category by path
export const getCategoryByPathHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawPath = req.query.path as string;
    const path = decodeURIComponent(rawPath);

    if (!path || typeof path !== "string") {
      sendError({
        res,
        status: 400,
        message: `You must input a valid path of category!`,
        code: "VALIDATION_ERROR",
        details: ["Missing or invalid 'path' query parameter."],
      });

      return;
    }

    const category = await CategoryModel.findOne({ path });

    if (!category) {
      sendError({
        res,
        status: 404,
        message: "Category not found by path.",
        code: "NOT_FOUND",
        details: [`Path: ${path}`],
      });

      return;
    }

    sendSuccess({
      res,
      message: "Category fetched successfully!",
      data: category,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: true,
    });
  }
};

// Get Category by slug
export const getCategoryBySlugHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== "string") {
      sendError({
        res,
        status: 400,
        message: `You must input a valid slug of category!`,
        code: "VALIDATION_ERROR",
        details: ["Missing or invalid 'slug' query parameter."],
      });

      return;
    }

    const category = await CategoryModel.findOne({ slug });
    if (!category) {
      sendError({
        res,
        status: 404,
        message: `Can not find category with slug!`,
        code: "NOT FOUND",
        details: [`Slug: ${slug}`],
      });
    }

    sendSuccess({
      res,
      status: 200,
      message: "Category fetch successfully!",
      data: category,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: true,
    });
  }
};

// Get category handler
export const getCategoryHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { identifier } = req.params;
  try {
    if (mongoose.isValidObjectId(identifier)) {
      await getCategoryHandlerById(req, res);
    } else {
      await getCategoryHandlerBySlug(req, res);
    }
  } catch (error) {
    next(error);
  }
};

// Delete Container
export const deleteContainerByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryId = req.params.id;
    const existingCategory = await CategoryModel.findByIdAndDelete(categoryId);
    if (!existingCategory) {
      sendError({
        res,
        status: 404,
        message: `Category with ID ${categoryId} does not exsit!`,
        code: "NOT_FOUND",
        details: ["Invalid category ID"],
      });
    }

    sendSuccess({
      res,
      message: `Category with ID ${categoryId} deleted successfully!`,
      data: existingCategory,
    });
  } catch (error: unknown) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: process.env.NODE_ENV === "development",
    });
  }
};

export const updateCategoryhandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, isActive, description } = req.body;

    if (!name?.trim()) {
      sendError({
        res,
        status: 400,
        message: "Category name is required",
        code: "VALIDATION_ERROR",
        details: ["Name cannot be empty"],
      });
    }

    const updateData = {
      name: name.trim(),
      isActive,
      description: description?.trim(),
      slug: slugify(name, { lower: true, strict: true }),
      $set: {
        path: `/categories/${slugify(name, { lower: true, strict: true })}`,
      },
    };

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      sendError({
        res,
        status: 404,
        message: `Category with ID ${id} not found`,
        code: "NOT_FOUND",
        details: ["Invalid category ID"],
      });

      return;
    }

    sendSuccess({
      res,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: process.env.NODE_ENV === "development",
    });
  }
};
