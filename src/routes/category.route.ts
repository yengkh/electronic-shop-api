import express, { Router } from "express";
import {
  createCategoryHandler,
  getAllCategoryHandler,
  getCategoryHandler,
  deleteContainerByIdHandler,
  updateCategoryhandler,
} from "../controllers/category.controller";

const router: Router = express.Router();

router.post("/", createCategoryHandler);
router.get("/", getAllCategoryHandler);
router.get("/:identifier", getCategoryHandler);
router.delete("/:id", deleteContainerByIdHandler);
router.put("/:id", updateCategoryhandler);

export default router;
