import { z } from "zod";

export const supplierDueSchema = z.object({
  supplier_id: z.number().min(1, "Supplier is required"),
  stock_movement_id: z.coerce
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  due_date: z.string().min(1, "Due date is required"),
  total_amount: z.number().min(0.01, "Total amount must be greater than 0"),
  paid_amount: z.number().min(0, "Paid amount cannot be negative").optional(),
  status: z.enum(["pending", "partial", "paid", "overdue", "cancelled"]),
  due_type: z.enum(["purchase", "credit", "other"]),
  description: z.string().optional(),
});

export type SupplierDueSchemaType = z.infer<typeof supplierDueSchema>;