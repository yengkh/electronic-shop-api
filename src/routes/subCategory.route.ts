import express, { Router } from "express";
import {
  createSubcategoryHandler,
  getAllSubcategoryHandler,
  deleteSubcategoryHandler,
  getSubcategoryByIdentifier,
  updateSubcategoryHandler,
  getSubcategoryByCategoryIdHandler,
  getSubcategoryByPath,
  getSubcategoryHandlerBySlug,
} from "../controllers/subcategory.controller";
import { createUploader } from "../utils/singleFileStorage";

const upload = createUploader("subcategories");

const router: Router = express.Router();

router.post("/", upload.single("image"), createSubcategoryHandler);
router.get("/", getAllSubcategoryHandler);
router.get("/:identifier", getSubcategoryByIdentifier);
router.get("/category/:categoryId", getSubcategoryByCategoryIdHandler);
router.get("/subcategory/by-path", getSubcategoryByPath);
router.get("/slug/:identifier", getSubcategoryHandlerBySlug);
router.delete("/:id", deleteSubcategoryHandler);
router.put("/:id", upload.single("image"), updateSubcategoryHandler);

export default router;
