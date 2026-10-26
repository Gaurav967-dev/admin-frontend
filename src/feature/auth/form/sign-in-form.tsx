"use client";

import { useState } from "react";
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

export default function SignInForm() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

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

            router.replace(getHomeRoute(result.user.role));
            router.refresh();
        } catch(error){
            if(error instanceof ApiError && error.status === 401){
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
                    <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "signin-password-error" : undefined}
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