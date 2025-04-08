import mongoose from "mongoose";
import config from "./env";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, {
      autoIndex: !config.isProduction,
    });

    console.log("🗄️  MongoDB connected successfully");

    // Debug logging in development
    if (!config.isProduction) {
      mongoose.set("debug", true);
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Graceful shutdown
const shutdownDB = async (): Promise<void> => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed");
  process.exit(0);
};

// For nodemon restarts
process.once("SIGUSR2", async () => {
  await shutdownDB();
  process.kill(process.pid, "SIGUSR2");
});

// For app termination
process.on("SIGINT", async () => {
  await shutdownDB();
});

export default connectDB;
