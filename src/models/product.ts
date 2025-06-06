import mongoose from "mongoose";
import { z } from "../lib/zod.js";
const CategoryEnum = {
  Electronics: "electronics",
  Jewelery: "jewelery",
  MenSClothing: "men's clothing",
  WomenSClothing: "women's clothing",
} as const;

const productMongooseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: Object.values(CategoryEnum),
    },
    image: { type: String, required: true },
    rating: {
      rate: { type: Number, required: true },
      count: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);
export const ProductInputSchema = z.object({
  title: z.string(),
  price: z.number().positive(),
  description: z.string(),
  category: z.enum(Object.values(CategoryEnum)),
  image: z.url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().min(0),
  }),
});
export const ProductBulkInputSchema = z.array(ProductInputSchema);

export const ProductModel = mongoose.model("Product", productMongooseSchema);
export { CategoryEnum as Category };
