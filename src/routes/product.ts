import express, { Request, Response, Router, NextFunction } from "express";
import {
  ProductInputSchema,
  ProductModel,
  ProductBulkInputSchema,
} from "../models/product.js";
import { AppError } from "../utils/errors.js";
import authMiddleware from "../middleware/auth.js";
import { fromError, fromZodError } from "zod-validation-error";
import { z } from "zod/v4";
const router: Router = express.Router();

// Create new product
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, success, data } = ProductInputSchema.safeParse(req.body);
      if (!success) {
        return next(AppError.fromZodError(error, 400));
      }
      const product = new ProductModel(data);
      const result = await product.save();
      res.status(201).json(result);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

router.post(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || typeof req.body.term !== "string") {
        return next(
          new AppError("Search term is required and must be a string", 400)
        );
      }

      const { term, type } = req.body;

      if (term.trim().length === 0) {
        return next(new AppError("Search term cannot be empty", 400));
      }

      // Create a case-insensitive regex pattern
      const searchRegex = new RegExp(term, "i");
      if (!type) {
        const customers = await ProductModel.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
          ],
        });
        res.json(customers);
        return;
      }
      if (["title", "description", "category"].includes(type)) {
        const customers = await ProductModel.find({
          [type]: searchRegex,
        });
        res.json(customers);
        return;
      }
      if ("price" === type) {
        const customers = await ProductModel.find({
          price: Number.parseFloat(term),
        });
        res.json(customers);
        return;
      }
      if ("rating" === type) {
        const customers = await ProductModel.find({
          "rating.rate": Number.parseFloat(term),
        });
        res.json(customers);
        return;
      }
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Bulk create products
router.post(
  "/bulk",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!Array.isArray(req.body)) {
        return next(
          new AppError("Request body must be an array of products", 400)
        );
      }

      // Validate each product

      const { error, success, data } = ProductBulkInputSchema.safeParse(
        req.body
      );

      if (!success) {
        return next(AppError.fromZodError(error, 400));
      }

      // Create all products in a single operation
      const products = await ProductModel.insertMany(data, {
        ordered: false, // Continues inserting even if there are errors
        rawResult: false, // Returns the documents instead of raw result
      });

      res.status(201).json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Get all products
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.find();
    res.json(products);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Get products with pagination
router.get(
  "/page/:number",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const number = parseInt(req.params.number);
      const products = await ProductModel.find()
        .skip((number - 1) * 10)
        .limit(10);
      res.json(products);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Get product by id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return next(new AppError("Product not found", 404));
    }
    res.json(product);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Update product
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, success, data } = ProductInputSchema.partial().safeParse(
        req.body
      );
      if (!success) {
        return next(AppError.fromZodError(error, 400));
      }

      const product = await ProductModel.findByIdAndUpdate(
        req.params.id,
        data,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!product) {
        return next(new AppError("Product not found", 404));
      }
      res.json(product);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Delete product
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.findByIdAndDelete(req.params.id);
      if (!product) {
        return next(new AppError("Product not found", 404));
      }
      res.status(204).send();
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

export default router;
