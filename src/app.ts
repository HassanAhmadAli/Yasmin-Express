import express, { Request, Response, NextFunction } from "express";
import signupRoute from "./routes/signup.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/login.js";
import customerRoutes from "./routes/customer.js";
import productRoutes from "./routes/product.js";
import { env } from "./utils/env.js";
import publicRouter from "./routes/public.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { PostRouter } from "./routes/post.js";
const app = express();
const corsOptions = {
  origin: /^.*/,
};
app.use(cors(corsOptions));
app.use(async (req, res, next) => {
  setTimeout(next, 0);
});
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: env.jwtPrivateKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);
app.use("/api/signup", signupRoute);
app.use("/api/login", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/public", publicRouter);
app.use("/api/post", PostRouter);
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(req.url);
    next();
  }
);
app.use(errorHandler);
export { app };
