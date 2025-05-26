import { Router } from "express";
import {
  getAllUsersHandler,
  getUserByIDHandler,
  getCurrentUserhandler,
  updateUserHandler,
  deleteUserHandler,
  updateUserProfileImageHandler,
  removeUserAvatarHandler,
  changePasswordHandler,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate.middleware";
import { createUploader } from "../utils/singleFileStorage";

const router: Router = Router();
const upload = createUploader("userAvatars");

router.get("/list", authenticate(["admin"]), getAllUsersHandler);
router.get("/by-id/:userId", authenticate(["admin"]), getUserByIDHandler);
router.get("/me", authenticate(["admin"]), getCurrentUserhandler);
router.get(
  "/profile",
  authenticate(["admin", "customer"]),
  getCurrentUserhandler
);

router.patch("/:userId", authenticate(["admin"]), updateUserHandler);
router.patch(
  "/profile/avatar/:userId",
  upload.single("image"),
  authenticate(["admin"]),
  updateUserProfileImageHandler
);
router.patch(
  "/profile/avatar/remove/:userId",
  authenticate(["admin"]),
  removeUserAvatarHandler
);
router.patch(
  "/:userId/change-password",
  authenticate(["admin", "customer"]),
  changePasswordHandler
);

router.delete("/:userId", authenticate(["admin"]), deleteUserHandler);

export default router;
