import express, { Request, Response, Router, NextFunction } from "express";
import {
  CustomerModel,
  CustomerInputSchema,
  CustomerBulkInputSchema,
} from "../models/customer.js";
import { AppError } from "../utils/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import mongoose from "mongoose";
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

router.post(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || !(typeof req.body.term === "string")) {
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
      const customers = await CustomerModel.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { address: searchRegex },
          { username: searchRegex },
        ],
      });
      res.json(customers);
      return;
    } else {
      const searchTypeRegex = new RegExp(term, "i");
      const customers = await CustomerModel.find({
        [type]: searchTypeRegex,
      });
      res.json(customers);
      return;
    }
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const customers = await CustomerModel.find();
  res.json(customers);
});

router.get(
  "/page/:number",
  async (req: Request, res: Response, next: NextFunction) => {
    const number: any = req.params.number;
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
    const data = CustomerBulkInputSchema.parse(req.body);
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