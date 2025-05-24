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


/**
 * @swagger
 * /sub-category/slug/{identifier}:
 *   get:
 *     summary: Get Subcategory by slug
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: The Subcategory slug
 *     responses:
 *       200:
 *         description: Subcategory found
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Can not get Subcategory
 */
router.get("/slug/:identifier", getSubcategoryHandlerBySlug);
router.delete("/:id", deleteSubcategoryHandler);
router.put("/:id", upload.single("image"), updateSubcategoryHandler);

export default router;
