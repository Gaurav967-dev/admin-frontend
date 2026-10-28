"use client";

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
import { getHomeRoute } from "@/lib/role-routes";
import { toast } from "sonner";
import { applyServerValidationErrors } from "@/lib/form-errors";
import PasswordInput from "@/components/custom-ui/password-input";

export default function SignUpForm() {
    const router = useRouter();

    const { register, handleSubmit, setError, formState: { errors, isSubmitting }} = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: { name: "", email: "", password: "", confirmPassword: ""},
    });

    async function onSubmit(values: SignUpValues) {
        try{
            const result = await signUp(values);

            toast.success("Account created successfully")

            router.replace(getHomeRoute(result.user.role));
            router.refresh();
        } catch(error){
            if (
                applyServerValidationErrors<SignUpValues>(
                    error,
                    setError,
                    [
                        "name",
                        "email",
                        "password",
                        "confirmPassword",
                    ]
                )
            ) {
                return;
            }

            if (error instanceof ApiError && error.status === 409) {
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
                    <PasswordInput
                        id="signup-password"
                        autoComplete="new-password"
                        placeholder="Enter your password"
                        {...register("password")}
                        aria-invalid={!!errors.password}
                    />
                </div>

                <FieldError
                    id="signup-password-error"
                    message={errors.password?.message}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <PasswordInput
                    id="signup-confirm"
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
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