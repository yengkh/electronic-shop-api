import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import Products from "../models/product.model";
import { handleHttpError } from "../utils/router500Error";
import { sendError, sendSuccess } from "../utils/apiRespone";
import { ProductRequestBody } from "@/types/productRequest.interface";
import {
  ProductInterface,
  ProductVariantInterface,
} from "@/types/product.interface";
import slugify from "slugify";
import Subcategory from "../models/subcategory.model";
import { generateSeoFields } from "../utils/seoGenerator";
import path from "path";
import fs from "fs";

const ProductModel = Products(mongoose);
const SubcategoryModel = Subcategory(mongoose);
const isDevelopment = process.env.NODE_ENV === "development";
const FILE_DOMAIN = process.env.FILE_DOMAIN || "http://192.168.43.83:3000";
const SUP_DOMAIN_IMAGE_PATH_PRODUCT =
  process.env.SUP_DOMAIN_IMAGE_PATH_PRODUCT || "/uploads/products/";

// Post product controller
export const createProductHandler = async (
  req: Request<{}, {}, ProductRequestBody>,
  res: Response
) => {
  try {
    let {
      color,
      stock = 1,
      discount = 0,
      price = 0,
      specs,
      isActive = true,
      label,
      name,
      brandId,
      categoryId,
      baseSpecs,
      description,
      discountStart,
      discountEnd,
    } = req.body;

    const exsitingProduct = await ProductModel.findOne({ slug: name });
    if (exsitingProduct) {
      sendError({
        res,
        status: 409,
        message: `Product with name ${name} is already exsit!`,
        code: "CONFLICT",
        details: ["duplicate data"],
      });

      return;
    }

    if (
      !mongoose.isValidObjectId(brandId) ||
      !mongoose.isValidObjectId(categoryId)
    ) {
      sendError({
        res,
        status: 400,
        message: `Brand ID ${brandId} is invalid!`,
        code: "VALIDATION_ERROR",
        details: ["bad requests"],
      });

      return;
    }
    if (!mongoose.isValidObjectId(categoryId)) {
      sendError({
        res,
        status: 400,
        message: `Category ID ${brandId} is invalid!`,
        code: "VALIDATION_ERROR",
        details: ["bad requests"],
      });

      return;
    }

    const brandDate = await SubcategoryModel.findById(brandId);
    if (!brandDate) {
      sendError({
        res,
        status: 404,
        code: "NOT_FOUND",
        message: `Brand with ID ${brandId} does not exsit!`,
        details: ["Validation invalid!"],
      });
    }

    const { seoTitle, seoDescription } = generateSeoFields(name, description);

    const slug = slugify(name.trim(), { lower: true, strict: true });
    const productPath = `${brandDate?.path}/${slug}`.replace(/\/+/g, "/");
    const discountPrice =
      price - parseFloat(((price * discount) / 100).toFixed(2));

    if (typeof specs === "string") {
      specs = JSON.parse(specs);
    } else if (typeof specs === "object") {
      specs = specs;
    }

    if (typeof baseSpecs === "string") {
      baseSpecs = JSON.parse(baseSpecs);
    } else if (typeof baseSpecs === "object") {
      baseSpecs = baseSpecs;
    }

    let imagesData: string[] = [];

    if (req.files) {
      if (!Array.isArray(req.files)) {
        const imageFiles = req.files["image"] || [];

        imagesData = imageFiles.map(
          (file) =>
            `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_PRODUCT}${file.filename}`
        );
      } else {
        // This block is optional — handle case where you used .array() instead of .fields()
        imagesData = req.files.map(
          (file) =>
            `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_PRODUCT}${file.filename}`
        );
      }
    }

    const variants: ProductVariantInterface[] = [
      {
        color,
        stock,
        discount,
        discountStart,
        discountEnd,
        price,
        discountPrice,
        isActive,
        label,
        specs,
        images: imagesData,
      },
    ];

    const product: ProductInterface = {
      brandId,
      categoryId,
      name,
      variants,
      baseSpecs,
      description,
      slug,
      path: productPath,
      seo: seoTitle,
      seoDescription,
    };

    const createProduct = await ProductModel.create(product);

    sendSuccess({
      res,
      status: 201,
      message: "New product was created!",
      data: createProduct,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Get all products controller
export const getAllProductsHandler = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await ProductModel.countDocuments({});

    const allProducts = await ProductModel.find({})
      .populate("brandId", "name slug path")
      .populate("categoryId", "name slug path")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    if (!allProducts) {
      sendSuccess({
        res,
        message: "Get product with empty respone!",
        data: [],
      });
    }

    sendSuccess({
      res,
      message: "Get product successfully!",
      data: {
        allProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
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

// Get prodct by path controller
export const getProductByPathHandler = async (req: Request, res: Response) => {
  try {
    const productPath = req.params.productPath;
    console.log(productPath);

    const exsitingProduct = await ProductModel.findOne({
      path: productPath,
    })
      .populate("brandId", "name slug path")
      .populate("categoryId", "name slug path")
      .sort({ createdAt: -1 })
      .lean();

    if (!exsitingProduct) {
      sendSuccess({
        res,
        message: "Respone with empty data!",
        data: [],
      });

      return;
    }

    sendSuccess({
      res,
      message: `Product with path ${productPath} was retrived successfully!`,
      data: exsitingProduct,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Get product by ID controller
export const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.identifier;
    const exsitingProduct = await ProductModel.findById(productId)
      .populate("categoryId", "name slug path")
      .populate("brandId", "name slug path")
      .sort({ createdAt: -1 })
      .lean();

    if (!exsitingProduct) {
      sendError({
        res,
        status: 404,
        message: `Can not find product!`,
        code: "NOT_FOUND",
        details: ["Error!"],
      });
      return;
    }

    sendSuccess({
      res,
      message: "Product retrived successfully!",
      data: exsitingProduct,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Get product by slug controller
const getProductBySlugHandler = async (req: Request, res: Response) => {
  try {
    const productSlug = req.params.identifier;
    const existingProduct = await ProductModel.findOne({ slug: productSlug })
      .populate("categoryId", "name slug path")
      .populate("brandId", "name slug path")
      .sort({ createdAt: -1 })
      .lean();

    if (!existingProduct) {
      sendError({
        res,
        status: 404,
        message: `Product not found!`,
        code: "NOT_FOUND",
        details: ["Error!"],
      });
      return;
    }

    sendSuccess({
      res,
      message: "Product retrived successfully!",
      data: existingProduct,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Get product by identifier controller
export const getProductByIdentifier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const identifier = req.params.identifier;

    if (mongoose.isValidObjectId(identifier)) {
      await getProductByIdHandler(req, res);
    } else {
      await getProductBySlugHandler(req, res);
    }
  } catch (error) {
    next(error);
  }
};

// Filter products
export const filterProductsHandler = async (req: Request, res: Response) => {
  try {
    const {
      name,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      hasDiscount,
      specs,
      isActive = true,
      sortBy,
      sortOrder = "asc",
      slug,
    } = req.query;

    const query: any = {};

    if (name) {
      query.name = { $regex: name as string, $options: "i" };
    }

    if (slug) {
      query.slug = { $regex: slug as string, $options: "i" };
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (brandId) {
      query.brandId = brandId;
    }

    if (isActive !== undefined) {
      query["variants.isActive"] = isActive === "true";
    }

    if (hasDiscount === "true") {
      query["variants.discount"] = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query["variants.price"] = {};
      if (minPrice) query["variants.price"].$gte = Number(minPrice);
      if (maxPrice) query["variants.price"].$lte = Number(maxPrice);
    }

    if (specs) {
      // Specs should be sent as JSON string: { "ram": "16GB" }
      const parsedSpecs = JSON.parse(specs as string);
      for (const [key, value] of Object.entries(parsedSpecs)) {
        query[`variants.specs.${key}`] = value;
      }
    }

    const sortOptions: Record<string, any> = {};
    if (sortBy) {
      sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;
    }

    const products = await ProductModel.find(query).sort(sortOptions);

    sendSuccess({
      res,
      message: "Products fetched successfully!",
      data: products,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Get Related Products
export const getRelatedProductsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { categoryId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await ProductModel.countDocuments({ categoryId });

    const relatedProducts = await ProductModel.find({ categoryId })
      .populate("brandId", "name slug path")
      .populate("categoryId", "name slug path")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalItems / limit);

    sendSuccess({
      res,
      message: "Get related products successfully!",
      data: {
        relatedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
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

// Update product controller
export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    let { name, brandId, categoryId, baseSpecs, description } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      sendError({
        res,
        status: 400,
        message: `Product ID ${productId} is not valid!`,
        code: "NOT_FOUND",
        details: ["error!"],
      });

      return;
    }

    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      sendError({
        res,
        status: 404,
        message: "Product not found!",
        code: "NOT_FOUND",
      });

      return;
    }

    const { seoTitle, seoDescription } = generateSeoFields(name, description);

    const slug = slugify(name.trim(), { lower: true, strict: true });

    const brandDate = await SubcategoryModel.findById(brandId);
    if (!brandDate) {
      sendError({
        res,
        status: 404,
        code: "NOT_FOUND",
        message: `Brand with ID ${brandId} does not exsit!`,
        details: ["Validation invalid!"],
      });

      return;
    }
    const productPath = `${brandDate?.path}/${slug}`.replace(/\/+/g, "/");

    if (typeof baseSpecs === "string") {
      baseSpecs = JSON.parse(baseSpecs);
    } else if (typeof baseSpecs === "object") {
      baseSpecs = baseSpecs;
    }

    const product: ProductInterface = {
      brandId,
      categoryId,
      name,
      baseSpecs,
      description,
      slug,
      path: productPath,
      seo: seoTitle,
      seoDescription,
    };

    const updateProdct = await ProductModel.findByIdAndUpdate(
      productId,
      product,
      {
        new: true,
      }
    );

    sendSuccess({
      res,
      message: `Product with ID was uodate successfully!`,
      data: updateProdct,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Update product variant controller
export const updateProductVariantHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, variantId } = req.params;
    let updates = req.body;

    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      sendError({
        res,
        status: 404,
        message: `Can not find product with ID ${id}`,
        code: "NOT_FOUND",
        details: ["Error!"],
      });

      return;
    }

    const specificVariant = existingProduct.variants?.find(
      (variant) => String(variant._id) === variantId
    );

    if (!specificVariant) {
      sendError({
        res,
        status: 404,
        message: `Can not find varaint with ID ${variantId}`,
        code: "NOT_FOUND",
        details: ["Error!"],
      });

      return;
    }

    if (updates.price !== undefined && updates?.discount !== undefined) {
      updates.discountPrice = parseFloat(
        (updates.price - (updates.price * updates.discount) / 100).toFixed(2)
      );
    } else if (updates.discount !== undefined) {
      updates.discountPrice = parseFloat(
        (
          specificVariant.price -
          (specificVariant.price * updates.discount) / 100
        ).toFixed(2)
      );
    } else if (updates.price !== undefined) {
      updates.discountPrice = parseFloat(
        (
          updates.price -
          (updates.price * specificVariant.discount) / 100
        ).toFixed(2)
      );
    } else {
      updates.discountPrice = specificVariant.discountPrice;
    }

    if (typeof updates.specs === "string") {
      updates.specs = JSON.parse(updates.specs);
    } else if (typeof updates.specs === "object") {
      updates.specs = updates.specs;
    }
    let imagesData: string[] = [];
    if (req.files) {
      if (!Array.isArray(req.files)) {
        const imageFiles = req.files["image"] || [];

        imagesData = imageFiles.map(
          (file) =>
            `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_PRODUCT}${file.filename}`
        );
      } else {
        // This block is optional — handle case where you used .array() instead of .fields()
        imagesData = req.files.map(
          (file) =>
            `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_PRODUCT}${file.filename}`
        );
      }
    }

    updates.images = [...imagesData, ...specificVariant.images];

    const update = await ProductModel.updateOne(
      {
        _id: id,
        "variants._id": variantId,
      },
      {
        $set: Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [
            `variants.$.${key}`,
            value,
          ])
        ),
      }
    );

    if (update.modifiedCount === 0) {
      sendError({
        res,
        status: 404,
        message: "Variants not found!",
        code: "NOT_FOUND",
      });

      return;
    }

    sendSuccess({
      res,
      message: "Varaints was update successfully!",
      data: updates,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Add images to product variant controller
export const addProductImagesHandler = async (req: Request, res: Response) => {
  try {
    const { id, variantId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(variantId)) {
      sendError({
        res,
        status: 400,
        message: "ID that provide(s) is/are invalid!",
        code: "VALIDATION_ERROR",
        details: ["Bad Request!"],
      });

      return;
    }

    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      sendError({
        res,
        status: 404,
        message: `Product with ID ${id} does not exist!`,
        code: "NOT_FOUND",
      });
    }

    const specificVariant = existingProduct?.variants?.find(
      (variant) => String(variant._id) === variantId
    );

    if (!specificVariant) {
      sendError({
        res,
        status: 404,
        message: `Can not find varaint with ID ${variantId}`,
        code: "NOT_FOUND",
        details: ["Error!"],
      });

      return;
    }

    let imagesData: string[] = [];
    if (req.files) {
      if (!Array.isArray(req.files)) {
        const imageFiles = req.files["image"] || [];

        imagesData = imageFiles.map(
          (file) =>
            `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_PRODUCT}${file.filename}`
        );
      } else {
        // This block is optional — handle case where you used .array() instead of .fields()
        imagesData = req.files.map(
          (file) =>
            `${FILE_DOMAIN}${SUP_DOMAIN_IMAGE_PATH_PRODUCT}${file.filename}`
        );
      }
    }

    await ProductModel.updateOne(
      { _id: id, "variants._id": variantId },
      { $push: { "variants.$.images": { $each: imagesData } } }
    );

    sendSuccess({
      res,
      message: `Product variant images was added successfully!`,
      data: [...imagesData, ...specificVariant?.images],
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Remove Image from product's varaint
export const removeVariantImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, variantId } = req.params;
    const { imageIndex } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(variantId)) {
      sendError({
        res,
        status: 400,
        message: `ID that provide is/are invalid!`,
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      sendError({
        res,
        status: 404,
        message: `Product with ID ${id} does not exist!`,
        code: "NOT_FOUND",
      });

      return;
    }

    const specificVariant = existingProduct.variants?.find(
      (variant) => String(variant._id) === variantId
    );
    if (!specificVariant) {
      sendError({
        res,
        status: 404,
        message: `Product's variant with ID ${variantId} does not exist!`,
        code: "NOT_FOUND",
      });

      return;
    }

    // Check variant's images field with iamgeIndex
    if (specificVariant?.images?.length > imageIndex) {
      const removeImageFileName = specificVariant?.images[parseInt(imageIndex)]
        .split("/")
        .pop();
      const removeImageFilePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        "products",
        removeImageFileName!
      );

      if (fs.existsSync(removeImageFilePath)) {
        fs.unlinkSync(removeImageFilePath);
        isDevelopment ??
          console.log(`Image ${removeImageFileName} deleted successfully.`);
      } else {
        isDevelopment ?? console.log(`Image ${removeImageFileName} not found.`);
      }

      specificVariant.images.splice(parseInt(imageIndex), 1);
    } else {
      sendError({
        res,
        status: 400,
        message: `Product's variant images length is less then imageIndex!`,
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const dataAfterRemoveImage = await existingProduct.save();
    sendSuccess({
      res,
      message: "Image was remove successfully!",
      data: dataAfterRemoveImage,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Remove Images from product's varaint
export const removeVariantImagesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, variantId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(variantId)) {
      sendError({
        res,
        status: 400,
        message: `ID that provide is/are invalid!`,
        code: "VALIDATION_ERROR",
      });

      return;
    }

    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      sendError({
        res,
        status: 404,
        message: `Product with ID ${id} does not exist!`,
        code: "NOT_FOUND",
      });

      return;
    }

    const specificVariant = existingProduct.variants?.find(
      (variant) => String(variant._id) === variantId
    );
    if (!specificVariant) {
      sendError({
        res,
        status: 404,
        message: `Product's variant with ID ${variantId} does not exist!`,
        code: "NOT_FOUND",
      });

      return;
    }

    for (const image of specificVariant.images) {
      const imageFileName = image.split("/").pop();
      const imageFilePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        "products",
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

    const afterRemoveAllImages = await ProductModel.updateOne(
      { _id: id, "variants._id": variantId },
      { $set: { "variants.$.images": [] } }
    );

    sendSuccess({
      res,
      message: "Product's varaint iamges was removed!",
      data: afterRemoveAllImages,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};

// Delete product controller
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    if (!productId && mongoose.isValidObjectId(productId)) {
      sendError({
        res,
        status: 400,
        message: `Proscut Id is invalid!`,
        code: "VALIDATION_ERROR",
        details: ["bad requests"],
      });

      return;
    }

    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) {
      sendError({
        res,
        status: 404,
        message: `Product with ID ${productId} does not exsit!`,
        code: "NOT_FOUND",
        details: ["errors"],
      });

      return;
    }

    const productVariants = existingProduct?.variants || [];
    for (const variant of productVariants) {
      if (Array.isArray(variant.images)) {
        for (const image of variant.images) {
          const imageFileName = image.split("/").pop();
          const imageFilePath = path.join(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            "products",
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
      }
    }

    const deletedProduct = await existingProduct.deleteOne();
    sendSuccess({
      res,
      message: "Product retrived successfully!",
      data: deletedProduct,
    });
  } catch (error) {
    handleHttpError(error, res, {
      statusCode: 500,
      exposeDetails: isDevelopment,
    });
  }
};
