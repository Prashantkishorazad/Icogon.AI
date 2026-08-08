import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const signupSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type SignupFormData = z.infer<typeof signupSchema>;