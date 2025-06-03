import express, { Request, Response, Router, NextFunction } from "express";
import { Post, validatePost, validateUpdatePost } from "../models/post.js";
import { AppError } from "../utils/errors.js";
import authMiddleware from "../middleware/auth.js";

export const PostRouter: Router = express.Router();

// Create new post
PostRouter.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = validatePost(req.body);
      if (error) {
        return next(new AppError(error.message, 400));
      }
      const post = new Post(req.body);
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
    const posts = await Post.find().populate("customer").exec();

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
      const posts = await Post.find()
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
      const post = await Post.findById(req.params.id)
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
      const { error } = validateUpdatePost(req.body);
      if (error) {
        return next(new AppError(error.message, 400));
      }

      const post = await Post.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
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
      const post = await Post.findOneAndDelete({
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
      if (!Array.isArray(req.body)) {
        return next(
          new AppError("Request body must be an array of posts", 400)
        );
      }

      // Validate each post
      req.body.forEach((post, index) => {
        const { error } = validatePost(post);
        if (error) {
          return next(
            new AppError(`Post at index ${index}: ${error.message}`, 400)
          );
        }
      });

      // Create all posts in a single operation
      const posts = await Post.insertMany(req.body, {
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
