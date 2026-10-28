import { z } from "zod";
import { strongPasswordSchema } from "@/feature/people/schema/user-schema";

const emailSchema = z.string().trim().min(1, "Email is required").pipe(
    z.email({error: "Enter a valid email adddress"})
);

export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
    name: z.string().trim().min(1, "Name is required")
        .min(2, "Name must have at least 2 characters")
        .max(100, "Name is too long")
        .regex(
            /^\p{L}+(?: +\p{L}+)*$/u,
            "Name must contain letters and spaces only"
        ),

    email: emailSchema,

    password: strongPasswordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;