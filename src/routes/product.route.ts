import express, { Router } from "express";
import { createUploader } from "../utils/singleFileStorage";
import {
  createProductHandler,
  getAllProductsHandler,
  deleteProductHandler,
  getProductByIdentifier,
  updateProductHandler,
  updateProductVariantHandler,
  addProductImagesHandler,
  removeVariantImageController,
  removeVariantImagesController,
  filterProductsHandler,
  getRelatedProductsHandler,
  getProductByPathHandler,
} from "../controllers/product.controller";

const router: Router = express.Router();
const upload = createUploader("products");

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 50 }]),
  createProductHandler
);
router.get("/", getAllProductsHandler);
router.get("/:identifier", getProductByIdentifier);
router.get("/filter/products", filterProductsHandler);
router.get("/related/products", getRelatedProductsHandler);
router.get("/product/by-path", getProductByPathHandler);
router.delete("/:id", deleteProductHandler);
router.patch(
  "/:id",
  upload.fields([{ name: "image", maxCount: 10 }]),
  updateProductHandler
);
router.patch(
  "/:id/variant/:variantId",
  upload.fields([{ name: "image", maxCount: 10 }]),
  updateProductVariantHandler
);
router.patch(
  "/:id/variant/:variantId/images/add",
  upload.fields([{ name: "image", maxCount: 10 }]),
  addProductImagesHandler
);
router.patch(
  "/:id/variant/:variantId/image/remove",
  removeVariantImageController
);
router.patch(
  "/:id/variant/:variantId/images/remove",
  removeVariantImagesController
);

export default router;
