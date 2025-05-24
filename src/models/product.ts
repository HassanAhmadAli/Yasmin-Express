import mongoose from "mongoose";
import Joi from "joi";
import _ from "lodash";
const CategoryEnum = {
  Electronics: "electronics",
  Jewelery: "jewelery",
  MenSClothing: "men's clothing",
  WomenSClothing: "women's clothing",
} as const;

const productSchema = new mongoose.Schema(
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
      rate: { type: Number, required: true, min: 0, max: 5 },
      count: { type: Number, required: true, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const validateProduct = (product: unknown) => {
  const schema = Joi.object({
    id: Joi.number().optional(),
    title: Joi.string().required(),
    price: Joi.number().positive().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .valid(...Object.values(CategoryEnum))
      .required(),
    image: Joi.string().uri().required(),
    rating: Joi.object({
      rate: Joi.number().min(0).max(5).required(),
      count: Joi.number().min(0).required(),
    }).required(),
  });

  return schema.validate(product);
};

export type ProductSchemaType = mongoose.InferSchemaType<typeof productSchema>;
///
export interface IProduct extends mongoose.Document, ProductSchemaType {}

///
export const Product = mongoose.model<IProduct>("Product", productSchema);
export { CategoryEnum as Category };
