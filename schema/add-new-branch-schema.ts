// lib/validations/user.ts
import { z } from "zod";

export const branchSchema = z.object({
    name: z.string()
        .min(3, "branch name must be at least 3 characters")
        .max(20, "branch name must be less than 20 characters"),
    country: z.string()
        .min(3, "country must be at least 3 characters")
        .max(20, "country must be less than 20 characters"),
    city: z.string()
        .min(3, "city must be at least 3 characters")
        .max(20, "city must be less than 20 characters"),
    address: z.string()
        .min(3, "address must be at least 3 characters")
        .max(200, "address must be less than 200 characters"),
    isMain: z.boolean().default(false),
    status: z.enum(["active", "In-active", "archived"]),
});

export type BranchSchemaType = z.infer<typeof branchSchema>;