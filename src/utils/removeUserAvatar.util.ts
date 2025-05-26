import path from "path";
import fs from "fs";

const isDevelopmentCheck = process.env.NODE_ENV === "development";

export const removeUserAvatar = (userAvatarUrl: string): void => {
  const oldImageName = userAvatarUrl.split("/").pop();
  const oldImagePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    "userAvatars",
    oldImageName || ""
  );

  if (oldImageName && fs.existsSync(oldImagePath)) {
    fs.unlinkSync(oldImagePath);
    console.log(`✅  Old image "${oldImageName}" deleted successfully.`);
  } else if (isDevelopmentCheck) {
    console.log(`⚠️  Image "${oldImageName}" not found for deletion.`);
  }
};
