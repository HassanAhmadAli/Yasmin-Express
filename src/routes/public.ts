import express, { Request, Response, NextFunction } from "express";
import authMiddleware from "../middleware/auth.js";
import { publicDir } from "../utils/path.js";
import public_csrf from "./public_csrf.js";
const router = express.Router();
router.use("/protected", authMiddleware, express.static(publicDir));
router.use("/", express.static(publicDir));
router.use(public_csrf);
export default router;
