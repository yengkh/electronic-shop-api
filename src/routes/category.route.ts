import express, { Router } from "express";
import {
  createCategoryHandler,
  getAllCategoryHandler,
  getCategoryHandler,
  deleteContainerByIdHandler,
  updateCategoryhandler,
  getCategoryByPathHandler,
  getCategoryBySlugHandler,
} from "../controllers/category.controller";

const router: Router = express.Router();

router.post("/", createCategoryHandler);
router.get("/", getAllCategoryHandler);
router.get("/:identifier", getCategoryHandler);

/**
 * @swagger
 * /category/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The category slug
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 *       500:
 *         description: Can not get category
 */
router.get("/slug/:slug", getCategoryBySlugHandler);

/**
 * @swagger
 * /category/by-path:
 *   get:
 *     summary: Get category by path
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Full category path (e.g. /categories/computer-accessories)
 *     responses:
 *       200:
 *         description: Category found
 */
router.get("/category/by-path", getCategoryByPathHandler);
router.delete("/:id", deleteContainerByIdHandler);
router.put("/:id", updateCategoryhandler);

export default router;
