// schema/supplier-schema.ts
import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  address: z.string().min(5, "Address must be at least 5 characters").max(500, "Address must be less than 500 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(15, "Phone number must be less than 15 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  cnic: z.string().min(13, "CNIC must be 13 characters").max(15, "CNIC must be less than 15 characters"),
  is_permanent: z.boolean().nullable().default(false),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export type SupplierSchemaType = z.infer<typeof supplierSchema>;