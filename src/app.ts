import { rootDir, publicDir } from "./utils/path.js";
import express, { Request, Response, NextFunction } from "express";
import user from "./models/user.js";
import mongoose from "mongoose";
import signupRoute from "./routes/signup.js";
import errorHandler from "./middleware/errorHandler.js";
import authMiddleware from "./middleware/auth.js";
import authRoutes from "./routes/login.js";
import env from "./utils/env.js";
import publicRouter from "./routes/public.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import bodyParser from "body-parser";
console.log(rootDir);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
// Add session middleware
app.use(
  session({
    secret: env.jwtPrivateKey || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

app.use("/api/signup", signupRoute);
app.use("/api/login", authRoutes);
app.use("/public", publicRouter);
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(req.url);
    next();
  }
);

app.use(errorHandler);
const PORT = env.PORT;

if (!env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

try {
  await mongoose.connect(env.MONGODB_URI, { dbName: "CFY" });
  console.log(`Connected to MongoDB with uri ${env.MONGODB_URI}`);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
}

export default app;
