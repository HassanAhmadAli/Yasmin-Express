import express, { Request, Response, Router, NextFunction } from "express";
import {
  PostModel,
  PostDoc,
  PostInputSchema,
  BulkPostInputSchema,
} from "../models/post.js";
import { AppError } from "../utils/errors.js";
import authMiddleware from "../middleware/auth.js";

export const PostRouter: Router = express.Router();

// Create new post
PostRouter.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = PostInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return next(new AppError(parseResult.error.message, 400));
      }
      const post = new PostModel(parseResult.data);
      const result = await post.save();
      res.status(201).json(result);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Get all posts
PostRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await PostModel.find().populate("customer").exec();

    res.json(posts);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Get posts with pagination
PostRouter.get(
  "/page/:number",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const number = parseInt(req.params.number);
      const posts = await PostModel.find()
        .populate("customer")
        .skip((number - 1) * 10)
        .limit(10)
        .exec();
      res.json(posts);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Get post by id
PostRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await PostModel.findById(req.params.id)
        .populate("customer")
        .exec();
      if (!post) {
        return next(new AppError("Post not found", 404));
      }
      res.json(post);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Update post
PostRouter.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = PostInputSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return next(new AppError(parseResult.error.message, 400));
      }
      const post = await PostModel.findOneAndUpdate(
        { _id: req.params.id },
        parseResult.data,
        { new: true, runValidators: true }
      );
      if (!post) {
        return next(new AppError("Post not found or unauthorized", 404));
      }
      res.json(post);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Delete post
PostRouter.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await PostModel.findOneAndDelete({
        _id: req.params.id,
      });

      if (!post) {
        return next(new AppError("Post not found or unauthorized", 404));
      }
      res.status(204).send();
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Bulk create posts
PostRouter.post(
  "/bulk",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseRes = BulkPostInputSchema.safeParse(req.body);
      if (!parseRes.success) {
        next(new AppError(parseRes.error.message, 400));
      }
      // Create all posts in a single operation
      const posts = await PostModel.insertMany(parseRes.data, {
        ordered: false, // Continues inserting even if there are errors
        rawResult: false, // Returns the documents instead of raw result
      });

      res.status(201).json({
        success: true,
        count: posts.length,
        posts,
      });
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);
