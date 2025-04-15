import { Request, Response, RequestHandler, NextFunction } from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import { sendError, sendSuccess } from "../utils/apiRespone";
import { handleHttpError } from "../utils/router500Error";
import Subcategory from "../models/subcategory.model";
import Category from "../models/category.model";
import fs from "fs";
import path from "path";
import { generateSeoFields } from "../utils/seoGenerator";

const FILE_DOMAIN = process.env.FILE_DOMAIN || "http://192.168.43.83:3000";
const SUP_DOMAIN_IMAGE_PATH_SUBCATEGORY =
  process.env.SUP_DOMAIN_IMAGE_PATH_SUBCATEGORY || "/uploads/subcategories/";
const SubcategoryModel = Subcategory(mongoose);
const CategoryModel = Category(mongoose);
const isDevelopment = process.env.NODE_ENV === "development";

export const createSubcategoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId, name, isActive = true, description = "" } = req.body;

    // 1. Validate required fields
    if (!name?.trim()) {
      sendError({
        res,
        status: 400,
        message: "Subcategory name is required",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    // 2. Check for duplicate name (case-insensitive)
    const existingSubcategory = await SubcategoryModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingSubcategory) {
      if (req.file) fs.unlinkSync(req.file.path);
      sendError({
        res,
        status: 409,
        message: `Subcategory "${name.trim()}" already exists`,
        code: "CONFLICT",
        details: ["Use a different name or edit the existing subcategory"],
      });
    }

    // 3. Verify parent category exists
    const parentCategory = await CategoryModel.findById(categoryId);
    if (!parentCategory) {
      if (req.file) fs.unlinkSync(req.file.path);
      sendError({
        res,
        status: 404,
        message: "Parent category not found",
        code: "NOT_FOUND",
      });

      return;
    }

    // 4. Generate slug and path
    const slug = slugify(name.trim(), { lower: true, strict: true });
    const path = `${parentCategory?.path}/${slug}`.replace(/\/+/g, "/");

    // 5. Handle image (if uploaded)
    let imageData = {};
    if (req.file) {
      imageData = {
        url: `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_SUBCATEGORY}${req.file.filename}`,
        altText: name.trim() || slug,
      };
    }

    const { seoTitle, seoDescription } = generateSeoFields(name, description);

    // 6. Create subcategory
    const subcategory = await SubcategoryModel.create({
      categoryId,
      name: name.trim(),
      isActive,
      description: description?.trim(),
      image: imageData,
      slug,
      path,
      seoTitle,
      seoDescription,
    });

    // 7. Return success response
    sendSuccess({
      res,
      status: 201,
      message: "Subcategory created successfully",
      data: subcategory,
    });
  } catch (error) {
    // Cleanup on error
    if (req.file?.path) fs.unlinkSync(req.file.path);
    handleHttpError(error, res);
  }
};

export const getAllSubcategoryHandler = async (req: Request, res: Response) => {
  try {
    const subcategories = await SubcategoryModel.find({})
      .populate("categoryId", "name slug")
      .lean();

    sendSuccess({
      res,
      status: 200,
      message: "Subcategories retrieved successfully",
      data: subcategories,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

export const getSubcategoryHandlerBySlug = async (
  req: Request,
  res: Response
) => {
  try {
    const slug = req.params.identifier;

    if (!slug) {
      sendError({
        res,
        status: 400,
        message: "Invalid request",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const existingSubcategory = await SubcategoryModel.findOne({ slug });

    if (!existingSubcategory) {
      sendError({
        res,
        status: 404,
        message: `Subcategory with slug ${slug} does not exsit!`,
        code: "NOT_FOUND",
        details: ["Validation is invalid!"],
      });

      return;
    }

    sendSuccess({
      res,
      message: "Subcategory retrived successfully by slug!",
      data: existingSubcategory,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

export const getSubcategoryHandlerById = async (
  req: Request,
  res: Response
) => {
  const subcategoryId = req.params.identifier;

  if (!subcategoryId) {
    sendError({
      res,
      status: 400,
      message: "Invalid request",
      code: "VALIDATION_ERROR",
    });

    return;
  }

  const existingSubcategory = await SubcategoryModel.findById(
    subcategoryId
  ).lean();

  if (!existingSubcategory) {
    sendError({
      res,
      status: 404,
      message: `Subcategory with ID ${subcategoryId} does not exsit!`,
      code: "NOT_FOUND",
      details: ["Validation is invalid!"],
    });
  }

  sendSuccess({
    res,
    message: "Subcategory retrived successfully by ID!",
    data: existingSubcategory,
  });
  try {
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

export const getSubcategoryByIdentifier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const identifier = req.params.identifier;

    if (mongoose.isValidObjectId(identifier)) {
      await getSubcategoryHandlerById(req, res);
    } else {
      await getSubcategoryHandlerBySlug(req, res);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteSubcategoryHandler = async (req: Request, res: Response) => {
  try {
    const subcategoryId = req.params.id;

    if (!subcategoryId) {
      sendError({
        res,
        status: 400,
        message: "Invalid request",
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const existingSubcategory = await SubcategoryModel.findById(subcategoryId);

    if (!existingSubcategory) {
      sendError({
        res,
        status: 404,
        message: `Subcategory with ID ${subcategoryId} does not exist!`,
        code: "NOT_FOUND",
        details: ["No response found!"],
      });
      return;
    }

    if (existingSubcategory.image?.url) {
      const imageFileName = existingSubcategory.image?.url.split("/").pop();
      const imageFilePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        "subcategories",
        imageFileName!
      );

      if (fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
        isDevelopment ??
          console.log(`Image ${imageFileName} deleted successfully.`);
      } else {
        isDevelopment ?? console.log(`Image ${imageFileName} not found.`);
      }
    }

    const deletedSubcategory = await SubcategoryModel.findByIdAndDelete({
      _id: subcategoryId,
    });

    if (!deletedSubcategory) {
      sendError({
        res,
        status: 404,
        message: `Subcategory with ID ${subcategoryId} does not exists!`,
        code: "NOT_FOUND",
        details: ["Find with empty repsone!"],
      });

      return;
    }

    sendSuccess({
      res,
      status: 200,
      message: `Subcatgory with ID ${subcategoryId} was deleted successfully!`,
      data: deletedSubcategory,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

export const updateSubcategoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subcategoryId = req.params.id;
    const { categoryId, name, isActive, description } = req.body;
    const image = req.file;

    const existingSubcategory = await SubcategoryModel.findById(subcategoryId);

    if (!existingSubcategory) {
      sendError({
        res,
        status: 404,
        message: `Subcategory with ID ${subcategoryId} not found`,
        code: "NOT_FOUND",
      });

      return;
    }

    let slug = existingSubcategory.slug;
    let subcategoryPath = existingSubcategory.path;
    if (name && name.trim() !== existingSubcategory.name) {
      slug = slugify(name.trim(), { lower: true, strict: true });
      const parentCategory = await CategoryModel.findById(
        existingSubcategory.categoryId
      );

      subcategoryPath = `${parentCategory?.path}/${slug}`.replace(/\/+/g, "/");
    }

    let imageData = {
      url: existingSubcategory.image?.url,
      altText: existingSubcategory.image?.altText,
    };

    if (slug !== existingSubcategory?.slug) {
      imageData.altText = slug;
    }

    if (image) {
      const imageFileName = existingSubcategory.image?.url?.split("/").pop();
      const imageFilePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        "subcategories",
        imageFileName || ""
      );

      // Delete old image file if it exists
      if (imageFileName && fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
        if (isDevelopment) {
          console.log(`🗑️  Old image "${imageFileName}" deleted successfully.`);
        }
      } else if (isDevelopment) {
        console.log(`⚠️  Image "${imageFileName}" not found for deletion.`);
      }

      // Replace with new image data
      imageData = {
        url: `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_SUBCATEGORY}${image.filename}`,
        altText: slug,
      };
    }

    // Check for name conflict only if the name is changing
    if (name && name.trim() !== existingSubcategory.name) {
      const nameExists = await SubcategoryModel.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: existingSubcategory._id },
      });

      if (nameExists) {
        sendError({
          res,
          status: 409,
          message: `Subcategory name "${name}" already exists. Please choose a new one!`,
          code: "CONFLICT",
          details: ["CONFLICT name value!"],
        });
        return;
      }
    }

    let isActiveCheck;
    if (isActive && typeof isActive === "string") {
      isActiveCheck = isActive.toLowerCase() === "true";
    }

    const { seoTitle, seoDescription } = generateSeoFields(
      name || existingSubcategory.name,
      description || existingSubcategory.description
    );

    const updatedSubcategoryData = {
      categoryId: categoryId ? categoryId : existingSubcategory.categoryId,
      name:
        typeof name === "string" && name.trim() !== ""
          ? name.trim()
          : existingSubcategory.name,
      isActive: isActiveCheck,
      description:
        typeof description === "string" && description.trim() !== ""
          ? description.trim()
          : existingSubcategory.description,
      image: imageData,
      slug,
      path: subcategoryPath,
      seoTitle,
      seoDescription,
    };

    const updatedSubcategory = await SubcategoryModel.findByIdAndUpdate(
      subcategoryId,
      updatedSubcategoryData,
      { new: true, runValidators: true }
    );

    sendSuccess({
      res,
      message: `Subcategory with ID ${subcategoryId} was updated successfully!`,
      data: updatedSubcategory,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};
