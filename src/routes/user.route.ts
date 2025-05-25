import { Router } from "express";
import {
  getAllUsersHandler,
  getUserByIDHandler,
  getCurrentUserhandler,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate.middleware";

const router: Router = Router();

router.get("/list", getAllUsersHandler);
router.get("/by-id/:userId", getUserByIDHandler);
router.get("/me", authenticate("admin"), getCurrentUserhandler);

export default router;
