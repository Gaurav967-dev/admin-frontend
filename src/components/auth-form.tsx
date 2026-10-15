"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileTextIcon } from "@/components/icons/file-text";
import AuthStatsPanel from "@/components/auth-stats-panel";
import { API_URL } from "@/lib/config";

type AuthFormProps = {
    mode: "signin" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const isSignup = mode === "signup";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (isSignup && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (isSignup && password.length < 12) {
            setError("Password must have at least 12 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/${isSignup ? "signup" : "sign"}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(isSignup ? {name, email, password} : {email, password}),
                }
            );

            const data = await response.json();

            if(!response.ok) {
                const message = typeof data.detail === "string" ? data.detail : "Please check your form details";

                throw new Error(message);
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh bg-[#f7f8fc] p-2 sm:p-3 md:h-dvh md:overflow-hidden">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-2xl bg-white md:h-full md:min-h-0 md:grid-cols-2 md:grid-rows-1">

                {/* Authentication form */}
                <div className="flex min-w-0 flex-col px-4 py-5 sm:px-7 md:min-h-0 md:overflow-y-auto md:px-6 lg:px-10 xl:px-14">

                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6048ce] text-white">
                        <FileTextIcon
                          size={22}
                          className="flex size-[22px] items-center justify-center"
                        />
                      </div>

                      <span className="text-2xl font-semibold tracking-tight text-[#6048ce]">
                        Expinova
                      </span>
                    </div>

                    <div className="my-auto mx-auto w-full max-w-sm py-3 md:py-4">

                        <div className="mb-4 text-center">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isSignup ? "Create your account" : "Welcome back"}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                {isSignup ? "Get started with your workspace" : "Sign in to manage your workspace"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">

                            {isSignup && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">Full name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        minLength={2}
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>

                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={isSignup ? 12 : undefined}
                                        className="pr-16"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {isSignup && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirm">Confirm Password</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                                >
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-11 w-full bg-black text-white hover:bg-gray-800"
                            >
                                {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
                            </Button>
                        </form>

                        <p className="mt-4 text-center text-sm text-gray-500">
                            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}

                            <Link
                                href={isSignup ? "/" : "sign-up"}
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                {isSignup ? "Sign in" : "Sign up"}
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-gray-400">
                        © 2026 Expinova. All rights reserved.
                    </p>
                </div>

                <AuthStatsPanel />
            </div>
        </div>
    )
}