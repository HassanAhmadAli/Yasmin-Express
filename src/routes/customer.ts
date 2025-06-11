import express, { Request, Response, Router, NextFunction } from "express";
import { CustomerModel, CustomerInputSchema } from "../models/customer.js";
import { AppError } from "../utils/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import mongoose from "mongoose";
import { z } from "../lib/zod.js";
const router: Router = express.Router();

router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = CustomerInputSchema.parse(req.body);
    const customer = new CustomerModel(data);
    try {
      await customer.save();
    } catch (error) {
      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        const duplicateField = Object.keys(error.keyValue || {}).join(", ");
        return next(new AppError(`${duplicateField} already exists`, 409));
      }
    }
    res.status(201).json(customer);
  }
);

const SearchRequestInput = z.object({
  term: z
    .string()
    .trim()
    .min(1)
    .transform((arg) => {
      return new RegExp(arg, "i");
    }),
  type: z
    .enum(["name", "email", "address", "username", "any"])
    .nullish()
    .transform((arg) => {
      if (!arg) return "any";
      return arg;
    }),
});
router.post(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    const data = SearchRequestInput.parse(req.body);
    if (data.type === "any") {
      const customers = await CustomerModel.find({
        $or: [
          { name: data.term },
          { email: data.term },
          { address: data.term },
          { username: data.term },
        ],
      });
      res.json(customers);
      return;
    }
    const customers = await CustomerModel.find({
      [data.type]: data.term,
    });
    res.json(customers);
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const customers = await CustomerModel.find();
  res.json(customers);
});

router.get(
  "/page/:number",
  async (req: Request, res: Response, next: NextFunction) => {
    const number = z.number().parse(req.params.number);
    const customers = await CustomerModel.find()
      .skip((number - 1) * 7)
      .limit(7);
    res.json(customers);
  }
);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }
  res.json(customer);
});

router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = CustomerInputSchema.parse(req.body);
    const customer = await CustomerModel.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return next(new AppError("Customer not found", 404));
    }
    res.json(customer);
  }
);

router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const customer = await CustomerModel.findByIdAndDelete(req.params.id);
    if (!customer) {
      return next(new AppError("Customer not found", 404));
    }
    res.status(204).send();
  }
);

router.post(
  "/bulk",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = z.array(CustomerInputSchema).parse(req.body);
    const products = await CustomerModel.insertMany(data, {
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
export default router;
