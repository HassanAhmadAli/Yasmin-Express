import { Request, Response, Router, NextFunction } from "express";
import { ProductInputSchema, ProductModel } from "../models/product.js";
import { AppError } from "../utils/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { z, ZodError } from "../lib/zod.js";
const router: Router = Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const data = ProductInputSchema.parse(req.body);
  const product = new ProductModel(data);
  const result = await product.save();
  res.status(201).json(result);
});

const SearchInput = z.discriminatedUnion("type", [
  z.object({
    type: z
      .enum(["title", "description", "category", "any"])
      .nullish()
      .transform((arg) => {
        if (!arg) return "any";
        return arg;
      }),
    term: z
      .string()
      .trim()
      .nonempty()
      .transform((arg) => new RegExp(arg, "i")),
  }),
  z.object({
    type: z.enum(["price", "rating"]),
    term: z.string().transform((arg) => Number.parseFloat(arg)),
  }),
]);

router.post(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    const data = SearchInput.parse(req.body);
    if (data.type === "any") {
      const customers = await ProductModel.find({
        $or: [
          { title: data.term },
          { description: data.term },
          { category: data.term },
        ],
      });
      res.json(customers);
      return;
    }
    if (["title", "description", "category"].includes(data.type)) {
      const customers = await ProductModel.find({
        [data.type]: data.term,
      });
      res.json(customers);
      return;
    }
    if (data.type === "price") {
      const customers = await ProductModel.find({
        price: data.term,
      });
      res.json(customers);
      return;
    }
    if (data.type === "rating") {
      const customers = await ProductModel.find({
        "rating.rate": data.term,
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
    const data = z.array(ProductInputSchema).parse(req.body);
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
  const products = await ProductModel.find().exec();
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

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const product = await ProductModel.findById(req.params.id).exec();
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  res.json(product);
});

router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = ProductInputSchema.partial().parse(req.body);
    const product = await ProductModel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    }).exec();
    if (!product) {
      return next(new AppError("Product not found", 404));
    }
    res.json(product);
  }
);

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
