import app from "./app";
import http from "http";
import config from "./config/env";
import connectDB from "./config/db";

const server = http.createServer(app);
// Start server after DB connection
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    server.listen(config.port, () => {
      console.log(
        `🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

// 6. Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// 7. Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error(`Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});
