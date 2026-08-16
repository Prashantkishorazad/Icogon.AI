import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<
  typeof loginSchema
>;

export const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name is required"),

    email: z
      .string()
      .email("Please enter a valid email address"),

    phone: z
      .string()
      .regex(
        /^[0-9]{10}$/,
        "Enter a valid 10-digit mobile number"
      ),

    password: z
      .string()
      .min(
        6,
        "Password must be at least 6 characters"
      ),

    confirmPassword: z
      .string()
      .min(
        6,
        "Please confirm your password"
      ),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type SignupFormData = z.infer<
  typeof signupSchema
>;