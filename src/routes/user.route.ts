import { Router } from "express";
import {
  getAllUsersHandler,
  getUserByIDHandler,
  getCurrentUserhandler,
  updateUserHandler,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate.middleware";

const router: Router = Router();

router.get("/list", authenticate("admin"), getAllUsersHandler);
router.get("/by-id/:userId", authenticate("admin"), getUserByIDHandler);
router.get("/me", authenticate("admin"), getCurrentUserhandler);
router.get("/profile", authenticate("customer"), getCurrentUserhandler);

router.patch("/:userId", authenticate("admin"), updateUserHandler);

export default router;
