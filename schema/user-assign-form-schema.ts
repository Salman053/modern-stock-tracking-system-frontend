// lib/validations/user.ts
import { z } from "zod";

export const userRegistrationSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

  email: z.string()
    .email("Please enter a valid email address"),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  confirmPassword: z.string(),

  branch_id: z.string()
    .min(1, "Please select a branch"),

  role: z.string()
    .min(1, "Please select a role"),
  status: z.enum(["active", "inactive","archived"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;