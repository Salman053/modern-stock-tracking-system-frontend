import { z } from "zod";

export const paymentSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  payment_date: z.string().min(1, "Payment date is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.enum(["cash", "bank_transfer", "digital_wallet", "cheque"]),
});

export type PaymentSchemaType = z.infer<typeof paymentSchema>;