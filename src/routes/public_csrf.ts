import express, { Request, Response, NextFunction } from "express";
import authMiddleware from "../middleware/auth.js";
import { publicDir } from "../utils/path.js";
const router = express.Router();
import csurf from "csurf";
import { env } from "../utils/env.js";

const csrf = csurf({
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  },
});

router.post("/protected/csrf", csrf, (req, res, next) => {
  res.json({ status: "success", message: "" });
});

export default router;
