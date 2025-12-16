import { z } from "zod";

export const saleItemSchema = z.object({
  product_id: z.number().positive("Product is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit_price: z.number().positive("Unit price must be greater than 0"),
  total: z.number().optional(),
});

export const saleSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  user_id: z.union([z.string(), z.number()]).optional(),
  branch_id: z.union([z.string(), z.number()]).optional(),
  customer_id: z.union([z.string(), z.number().positive()]),
  sale_date: z.string().default(() => new Date().toISOString().split("T")[0]),
  total_amount: z.number().min(0, "Total amount cannot be negative"),
  paid_amount: z.number().min(0, "Paid amount cannot be negative"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  profit: z.number().optional(),
  note: z.string().optional(),
  is_fully_paid: z.boolean().default(false),
  status: z.enum(['pending', 'completed', 'cancelled', 'active']).default('active'),
  sale_items: z.array(saleItemSchema).min(1, "At least one item is required"),
}).refine((data) => data.paid_amount <= data.total_amount, {
  message: "Paid amount cannot be greater than total amount",
  path: ["paid_amount"],
});

export type SaleFormData = z.infer<typeof saleSchema>;
export type SaleItemFormData = z.infer<typeof saleItemSchema>;