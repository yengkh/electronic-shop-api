import express from "express";
import {
  login,
  register,
  refreshTokenHandler,
} from "../controllers/auth.controller";
import { createUploader } from "../utils/singleFileStorage";
const router = express.Router();
const upload = createUploader("userAvatars");

router.post("/user/register", upload.single("image"), register);
router.post("/user/login", login);
router.post("/user/refresh-toekn", refreshTokenHandler);

export default router;
