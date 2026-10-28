"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/custom-ui/field-error";

import { signInSchema, type SignInValues } from "../schema/auth-schema";
import { signIn } from "@/service/auth-service";
import { ApiError } from "@/lib/api";
import { getHomeRoute } from "@/lib/role-routes";
import { toast } from "sonner";
import { applyServerValidationErrors } from "@/lib/form-errors";
import PasswordInput from "@/components/custom-ui/password-input";

export default function SignInForm() {
    const router = useRouter();

    const { register, handleSubmit, setError, formState: { errors, isSubmitting }} = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: SignInValues) {
        try{
            const result = await signIn(values);

            toast.success("Signed in successfully");

            router.replace(getHomeRoute(result.user.role));
            router.refresh();
        } catch(error){
            if (
                applyServerValidationErrors<SignInValues>(
                    error,
                    setError,
                    ["email", "password"]
                )
            ) {
                return;
            }

            if (error instanceof ApiError && error.status === 401) {
                setError("password", {
                    type: "server",
                    message: "Invalid email or password",
                });
                return;
            }
            
            setError("root.server", {
                type: "server",
                message: error instanceof Error ? error.message : "Unable to sign in",
            });
        }
    }

    return (
        <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
        >
            <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "signin-email-error" : undefined}
                />

                <FieldError
                    id="signin-email-error"
                    message={errors.email?.message}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signin-password">Password</Label>
                
                <div className="relative">
                    <PasswordInput
                        id="signin-password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "signin-password-error" : undefined}
                    />
                </div>

                <FieldError
                    id="signin-password-error"
                    message={errors.password?.message}
                />
            </div>

            <FieldError message={errors.root?.server?.message} />

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-black text-white hover:bg-gray-800"
            >
                {isSubmitting ? "Please wait..." : "Sign In"}
            </Button>
        </form>
    );
}