import { rootDir } from "./utils/path.js";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import user from "./models/user.js";
import mongoose from "mongoose";
import userRoutes from "./routes/users.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();
console.log("Hello, world!12342");
console.log(rootDir);

const app = express();

// Add middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Error handling middleware should be after all routes
app.use(errorHandler);
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

try {
  await mongoose.connect(MONGODB_URI, { dbName: "CFY" });
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
}

export default app;
