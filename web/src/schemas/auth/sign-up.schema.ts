import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        (value) => /[A-Z]/.test(value),
        "Password must contain at least one uppercase letter"
      )
      .refine(
        (value) => /[a-z]/.test(value),
        "Password must contain at least one lowercase letter"
      )
      .refine(
        (value) => /[0-9]/.test(value),
        "Password must contain at least one number"
      )
      .refine(
        (value) => /[^A-Za-z0-9]/.test(value),
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormType = z.infer<typeof signUpSchema>;
