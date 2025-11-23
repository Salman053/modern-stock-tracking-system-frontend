// schema/add-new-product-schema.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),
  
  type: z.string()
    .min(1, "Please select a product type"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  
  company: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  
  quantity: z.number()
    .min(0, "Quantity cannot be negative")
    .int("Quantity must be a whole number"),
  
  purchase_price_per_meter: z.number()
    .min(0, "Purchase price cannot be negative")
    .refine(val => val === 0 || val >= 0.01, "Purchase price must be at least 0.01"),
  
  sales_price_per_meter: z.number()
    .min(0, "Sales price cannot be negative")
    .refine(val => val === 0 || val >= 0.01, "Sales price must be at least 0.01"),
  
  status: z.enum(["active", "in-active", "out_of_stock","archived"]),
}).refine((data) => data.sales_price_per_meter >= data.purchase_price_per_meter, {
  message: "Sales price should be greater than or equal to purchase price",
  path: ["sales_price_per_meter"],
});

export type ProductSchemaType = z.infer<typeof productSchema>;