import { z } from "zod";

export const customerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters"),

    address: z
        .string()
        .min(10, "Address must be at least 10 characters")
        .max(500, "Address must not exceed 500 characters"),

    phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must not exceed 15 digits")
        .regex(/^\+?[\d\s\-\(\)]{10,}$/, "Please provide a valid phone number"),

    email: z
        .union([z.string().email("Invalid email address"), z.string().length(0)])
        .optional()
        .transform((e) => e === "" ? undefined : e),

    cnic: z
        .string()
        .length(13, "CNIC must be exactly 13 digits")
        .regex(/^\d{13}$/, "CNIC must contain only digits"),

    is_regular: z
        .boolean()
        .default(false),

    status: z
        .enum(["active", "inactive", "archived"])
        .default("active"),
});

export type CustomerSchemaType = z.infer<typeof customerSchema>;