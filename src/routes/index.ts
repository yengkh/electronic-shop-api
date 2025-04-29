import { Router, Request, Response } from "express";
import { Route } from "@/types/route.interface";

import userRoutes from "./user.route";
import CategoryRouter from "./category.route";
import SubCategoryRouter from "./subCategory.route";
import Products from "./product.route";

const router = Router();
const routes: Route[] = [
  {
    path: "",
    route: userRoutes,
  },
  {
    path: "/category",
    route: CategoryRouter,
  },
  {
    path: "/sub-category",
    route: SubCategoryRouter,
  },
  {
    path: "/product",
    route: Products,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

export default router;
