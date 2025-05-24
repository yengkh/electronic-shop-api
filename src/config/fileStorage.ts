import path from "path";

type UploadFolders = "subcategories" | "products" | "brands" | "userAvatars";

export const getUploadPath = (folder: UploadFolders) => {
  return path.join(__dirname, `../../public/uploads/${folder}`);
};
