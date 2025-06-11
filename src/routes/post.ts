import express, { Request, Response, Router, NextFunction } from "express";
import { PostModel, PostInputSchema } from "../models/post.js";
import { AppError } from "../utils/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { z } from "../lib/zod.js";
export const PostRouter: Router = express.Router();

PostRouter.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = PostInputSchema.parse(req.body);
    const post = new PostModel(data);
    const result = await post.save();
    res.status(201).json(result);
  }
);

PostRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const posts = await PostModel.find().populate("customer").exec();
  res.json(posts);
});

PostRouter.get(
  "/page/:number",
  async (req: Request, res: Response, next: NextFunction) => {
    const number = parseInt(req.params.number);
    const posts = await PostModel.find()
      .populate("customer")
      .skip((number - 1) * 10)
      .limit(10)
      .exec();
    res.json(posts);
  }
);

PostRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const post = await PostModel.findById(req.params.id)
      .populate("customer")
      .exec();
    if (!post) {
      return next(new AppError("Post not found", 404));
    }
    res.json(post);
  }
);

PostRouter.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = PostInputSchema.partial().parse(req.body);
    const post = await PostModel.findOneAndUpdate(
      { _id: req.params.id },
      data,
      { new: true, runValidators: true }
    ).exec();
    if (!post) {
      return next(new AppError("Post not found or unauthorized", 404));
    }
    res.json(post);
  }
);

PostRouter.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await PostModel.findOneAndDelete({
        _id: req.params.id,
      }).exec();
      if (!post) {
        return next(new AppError("Post not found or unauthorized", 404));
      }
      res.status(204).send();
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

PostRouter.post(
  "/bulk",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = z.array(PostInputSchema).parse(req.body);
    const posts = await PostModel.insertMany(data, {
      ordered: false,
      rawResult: false,
    });

    res.status(201).json({
      success: true,
      count: posts.length,
      posts,
    });
  }
);
