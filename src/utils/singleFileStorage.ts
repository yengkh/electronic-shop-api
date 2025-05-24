import multer from "multer";
import { getUploadPath } from "../config/fileStorage";
import path from "path";

type UploadFolders = "subcategories" | "products" | "brands" | "userAvatars";

export const createUploader = (folder: UploadFolders) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, getUploadPath(folder));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${folder}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({ storage });
};
