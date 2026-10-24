import { z } from "zod";

const commonUserSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters").max(100, "Name is too long"),

  email: z.string().trim().min(1, "Email is required")
    .pipe(
      z.email({
        error: "Enter a valid email address",
      })
    ),

  role: z.enum(["user", "admin"]),
  is_active: z.boolean(),
});

const passwordSchema = z.string().min(12, "Password must contain at least 12 characters").max(128, "Password is too long");

export const createUserSchema = commonUserSchema.extend({
  password: passwordSchema,
});

export const editUserSchema = commonUserSchema.extend({
  password: z.union([
    z.literal(""),
    passwordSchema,
  ]),
});

export type UserFormValues = z.infer<typeof createUserSchema>;