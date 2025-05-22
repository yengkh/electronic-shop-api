import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { errorConverter, errorHandler } from "./utils/error";
import ApiError from "./utils/apiError";
import routes from "./routes";
import { getRateLimitConfig } from "./config/ratingLimit";
import "../src/config/env";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app: Express = express();

// Security middleware
app.use(helmet());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
// Logging
app.use(morgan("combined"));

app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit(getRateLimitConfig());
app.use(limiter);

// Handle static files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// API routes
app.use("/api/v1", routes);

// Doscument
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Send 404 for unknown routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, "Not found"));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

export default app;
