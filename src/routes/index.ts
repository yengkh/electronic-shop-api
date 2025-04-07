import { Router, Request, Response } from "express";
import { Route } from "@/types/route.interface";

import userRoutes from "./user.routes";
const router = Router();
const routes: Route[] = [{ path: "", route: userRoutes }];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

export default router;
