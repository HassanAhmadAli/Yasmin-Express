import express, { Request, Response, Router, NextFunction } from "express";
import Customer, {
  validateWelcome as validateCustomer,
} from "../models/customer.js";
import { AppError } from "../utils/errors.js";
import { parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import authMiddleware from "../middleware/auth.js";
import { validateProduct } from "../models/product.js";

const router: Router = express.Router();

// Create new customer
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = validateCustomer(req.body);
      if (error) {
        return next(new AppError(error.message, 400));
      }

      const existingWelcome = await Customer.findOne({
        username: req.body.username,
      });
      if (existingWelcome) {
        return next(new AppError("Username already exists", 409));
      }
      try {
        const phoneNumber = parsePhoneNumberFromString(
          req.body.phone,
          "US"
        ) as PhoneNumber;
        req.body.phone = phoneNumber.format("E.164");
      } catch (error: any) {
        next(new AppError(error.message, 500));
      }

      const customer = new Customer(req.body);
      const result = await customer.save();
      res.status(201).json(result);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Get all customer
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

router.get(
  "/page/:number",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const number: any = req.params.number;
      const customers = await Customer.find()
        .skip((number - 1) * 7)
        .limit(7);
      res.json(customers);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Get customer by id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return next(new AppError("Welcome not found", 404));
    }
    res.json(customer);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
});

// Update customer
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = validateCustomer(req.body);
      if (error) {
        return next(new AppError(error.message, 400));
      }

      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!customer) {
        return next(new AppError("Customer not found", 404));
      }

      res.json(customer);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Delete customer
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) {
        return next(new AppError("Welcome not found", 404));
      }
      res.status(204).send();
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  }
);

// Bulk create Customers
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
      req.body.forEach((product, index) => {
        const { error } = validateCustomer(product);
        if (error) {
          return next(
            new AppError(`Product at index ${index}: ${error.message}`, 400)
          );
        }
      });

      // Create all products in a single operation
      const products = await Customer.insertMany(req.body, {
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

export default router;
