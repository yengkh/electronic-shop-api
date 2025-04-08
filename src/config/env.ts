import { AppConfig } from "@/types/appConfig.interface";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../../.env"), // Adjust path based on your structure
});

// Validate required environment variables
const validateEnvVars = (): void => {
  const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET"];
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Environment variable ${varName} is missing`);
    }
  });
};

// Create type-safe configuration object
const getConfig = (): AppConfig => {
  validateEnvVars();

  return {
    port: parseInt(process.env.PORT || "3000", 10),
    mongoUri: process.env.MONGO_URI as string,
    jwtSecret: process.env.JWT_SECRET as string,
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
  };
};

const config = getConfig();
export default config;
