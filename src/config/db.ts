import mongoose from "mongoose";
import config from "./env";
import chalk from "chalk";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, {
      autoIndex: !config.isProduction,
    });

    console.log(
      chalk.bold(chalk.blue("🗄️  MongoDB connected successfully ✔️"))
    );

    // Debug logging in development
    if (!config.isProduction) {
      mongoose.set("debug", true);
    }
  } catch (err) {
    console.error(chalk.bold(chalk.red("MongoDB connection error:", err)));
    process.exit(1);
  }
};

// Connection events
mongoose.connection.on("connected", () => {
  console.log(chalk.bold(chalk.green("Mongoose connected to DB!")));
});

mongoose.connection.on("error", (err) => {
  console.error(chalk.bold(chalk.red("Mongoose connection error:", err)));
});

mongoose.connection.on("disconnected", () => {
  console.log(chalk.bold(chalk.yellow("Mongoose disconnected!")));
});

// Graceful shutdown
const shutdownDB = async (): Promise<void> => {
  await mongoose.connection.close();
  console.log(chalk.bold(chalk.red("Mongoose connection closed ❌")));
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
