import express, { Request, Response, Router, NextFunction } from "express";
import Welcome, { validateWelcome } from "../models/welcome.js";
import { AppError } from "../utils/errors.js";
import authMiddleware from "../middleware/auth.js";

const router: Router = express.Router();

// Create new welcome
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = validateWelcome(req.body);
      if (error) {
        return next(new AppError(error.message, 400));
      }

      const existingWelcome = await Welcome.findOne({
        username: req.body.username,
      });
      if (existingWelcome) {
        return next(new AppError("Username already exists", 409));
      }

      const welcome = new Welcome(req.body);
      const result = await welcome.save();
      res.status(201).json(result);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Get all welcomes
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const welcomes = await Welcome.find();
    res.json(welcomes);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Get welcome by id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const welcome = await Welcome.findOne({ id: req.params.id });
    if (!welcome) {
      return next(new AppError("Welcome not found", 404));
    }
    res.json(welcome);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Update welcome
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = validateWelcome(req.body);
      if (error) {
        return next(new AppError(error.message, 400));
      }

      const welcome = await Welcome.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!welcome) {
        return next(new AppError("Welcome not found", 404));
      }

      res.json(welcome);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Delete welcome
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const welcome = await Welcome.findOneAndDelete({ id: req.params.id });
      if (!welcome) {
        return next(new AppError("Welcome not found", 404));
      }
      res.status(204).send();
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

export default router;
