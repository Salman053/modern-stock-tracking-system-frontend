import { z } from "zod";

export const employeeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
    address: z.string().min(10, "Address must be at least 10 characters").max(500, "Address must be less than 500 characters"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    designation: z.string().min(1, "Designation is required"),
    cnic: z.string().min(1, "CNIC is required"),
    is_permanent: z.boolean().default(true),
    salary: z.number().min(0, "Salary must be a positive number"),
    status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export type EmployeeSchemaType = z.infer<typeof employeeSchema>;