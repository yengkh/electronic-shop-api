import path from "path";

type UploadFolders = "subcategories" | "products" | "brands";

export const getUploadPath = (folder: UploadFolders) => {
  return path.join(__dirname, `../../public/uploads/${folder}`);
};
