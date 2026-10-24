"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/custom-ui/field-error";

import { signUpSchema, type SignUpValues } from "../schema/auth-schema";
import { signUp } from "@/service/auth-service";
import { ApiError } from "@/lib/api";

export default function SignUpForm() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, setError, formState: { errors, isSubmitting }} = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: { name: "", email: "", password: "", confirmPassword: ""},
    });

    async function onSubmit(values: SignUpValues) {
        try{
            await signUp(values);

            router.push("/dashboard");
            router.refresh();
        } catch(error){
            if(error instanceof ApiError && error.status === 409) {
                setError("email", {
                    type: "server",
                    message: "Email already registered",
                });
                return;
            }

            setError("root.server", {
                type: "server",
                message: error instanceof Error ? error.message : "Unable to create account",
            });
        }
    }

    return (
        <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
        >
            <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                    id="signup-name"
                    placeholder="Enter your name"
                    autoComplete="name"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "signup-name-error" : undefined}
                />

                <FieldError
                    id="signup-name-error"
                    message={errors.name?.message}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "signup-email-error" : undefined}
                />

                <FieldError
                    id="signup-email-error"
                    message={errors.email?.message}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                
                <div className="relative">
                    <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "signup-password-error" : undefined}
                        className="pr-16"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                <FieldError
                    id="signup-password-error"
                    message={errors.password?.message}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                    id="signup-confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
                />

                <FieldError
                    id="signup-confirm-error"
                    message={errors.confirmPassword?.message}
                />
            </div>

            <FieldError message={errors.root?.server?.message} />

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-black text-white hover:bg-gray-800"
            >
                {isSubmitting ? "Please wait..." : "Create Account"}
            </Button>
        </form>
    );
}