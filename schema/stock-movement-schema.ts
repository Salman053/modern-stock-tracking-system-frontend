import { z } from "zod";

export const stockMovementSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  movement_type: z.enum(["arrival", "dispatch", "transfer_in", "transfer_out", "adjustment"]),
  supplier_id: z.string().optional(),
  reference_branch_id: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price_per_meter: z.number().min(0, "Unit price cannot be negative"),
  paid_amount: z.number().min(0, "Paid amount cannot be negative").optional(),
  total_amount: z.number().min(0, "Total amount cannot be negative"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  auto_update_product: z.boolean().default(true),
}).refine((data) => {
  // Validate that paid amount doesn't exceed total amount
  if (data.paid_amount && data.paid_amount > data.total_amount) {
    return false;
  }
  return true;
}, {
  message: "Paid amount cannot exceed total amount",
  path: ["paid_amount"],
}).refine((data) => {
  // Validate supplier is required for arrivals
  if (data.movement_type === 'arrival' && !data.supplier_id) {
    return false;
  }
  return true;
}, {
  message: "Supplier is required for stock arrivals",
  path: ["supplier_id"],
}).refine((data) => {
  // Validate reference branch for transfers
  if ((data.movement_type === 'transfer_in' || data.movement_type === 'transfer_out') && !data.reference_branch_id) {
    return false;
  }
  return true;
}, {
  message: "Reference branch is required for transfers",
  path: ["reference_branch_id"],
});

export type StockMovementSchemaType = z.infer<typeof stockMovementSchema>;