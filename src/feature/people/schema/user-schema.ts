import { z } from "zod";

const nameSchema = z.string().trim().min(1, "Full name is required")
    .min(2, "Name must have at least 2 characters")
    .max(100, "Name is too long")
    .regex(
        /^\p{L}+(?: +\p{L}+)*$/u,
        "Name must conatin letters and spaces only"
    );

const emailSchema = z.string().trim().min(1, "Email is required")
    .pipe(z.email({ error: "Enter a valid email address" }));

export const strongPasswordSchema = z.string().trim().min(1, "Password is required")
    .min(12, "Password must contain at least 12 characters")
    .max(128, "Password is too long")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number")
    .regex(/[^A-Za-z0-9\s]/, "Include a special character");

const commonUserSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    role: z.enum(["user", "admin"]),
    is_active: z.boolean(),
});

export const createUserSchema = commonUserSchema.extend({
    password: strongPasswordSchema,
});

export const editUserSchema = commonUserSchema.extend({
    password: z.union([
        z.literal(""),
        strongPasswordSchema,
    ]),
});

export type UserFormValues = z.infer<typeof createUserSchema>;