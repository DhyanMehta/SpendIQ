import { z } from "zod";
import { Role } from "./types";

export const createUserSchema = z
  .object({
    name: z.string().min(2, "Name is required (min 2 chars)"),
    loginId: z
      .string()
      .min(6, "Login ID must be at least 6 characters")
      .max(12, "Login ID cannot exceed 12 characters")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Login ID must be alphanumeric (no spaces/symbols)",
      ),
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: "Please select a valid role" }),
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(
        /[0-9!@#$%^&*]/,
        "Must contain at least one number or special char",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
