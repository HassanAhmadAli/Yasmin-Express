import  { Request, Response, Router, NextFunction } from "express";
import {
  ProductInputSchema,
  ProductModel,
  ProductBulkInputSchema,
} from "../models/product.js";
import { AppError } from "../utils/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { z, ZodError } from "../lib/zod.js";
const router: Router = express.Router();

router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = ProductInputSchema.parse(req.body);
    const product = new ProductModel(data);
    const result = await product.save();
    res.status(201).json(result);
  }
);

router.post(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || typeof req.body.term !== "string") {
      return next(
        new AppError("Search term is required and must be a string", 400)
      );
    }
    const { term, type } = req.body;
    if (term.trim().length === 0) {
      return next(new AppError("Search term cannot be empty", 400));
    }
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
  }
);

router.post(
  "/bulk",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body)) {
      return next(
        new AppError("Request body must be an array of products", 400)
      );
    }
    const data = ProductBulkInputSchema.parse(req.body);
    const products = await ProductModel.insertMany(data, {
      ordered: false,
      rawResult: false,
    });
    res.status(201).json({
      success: true,
      count: products.length,
      products,
    });
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const products = await ProductModel.find();
  res.json(products);
});

router.get(
  "/page/:number",
  async (req: Request, res: Response, next: NextFunction) => {
    const number = parseInt(req.params.number);
    const products = await ProductModel.find()
      .skip((number - 1) * 10)
      .limit(10);
    res.json(products);
  }
);

// Get product by id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  res.json(product);
});

// Update product
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = ProductInputSchema.partial().parse(req.body);
    const product = await ProductModel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return next(new AppError("Product not found", 404));
    }
    res.json(product);
  }
);

// Delete product
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return next(new AppError("Product not found", 404));
    }
    res.status(204).send();
  }
);

export default router;
