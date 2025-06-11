import express, { Request, Response, NextFunction } from "express";
import { publicDir } from "../utils/path.js";
const router = express.Router();
router.use("/", express.static(publicDir));
export default router;
