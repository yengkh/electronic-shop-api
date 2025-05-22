import express, { Router } from "express";
import {
  createCategoryHandler,
  getAllCategoryHandler,
  getCategoryHandler,
  deleteContainerByIdHandler,
  updateCategoryhandler,
  getCategoryByPathHandler,
} from "../controllers/category.controller";

const router: Router = express.Router();

router.post("/", createCategoryHandler);
router.get("/", getAllCategoryHandler);
router.get("/:identifier", getCategoryHandler);
router.get("/category/by-path", getCategoryByPathHandler);
router.delete("/:id", deleteContainerByIdHandler);
router.put("/:id", updateCategoryhandler);

export default router;
