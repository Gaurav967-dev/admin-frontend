"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileTextIcon } from "@/components/icons/file-text";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
        <div className="min-h-screen bg-[#f7f8fc] p-3">
            <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-2xl bg-white lg:grid-cols-2">

                {/* Left side: Authentication form */}
                <div className="flex flex-col px-8 py-8 sm:px-16 lg:px-20">

                    
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

                    <div className="my-auto mx-auto w-full max-w-sm py-12">

                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isSignup ? "Create your account" : "Welcome back"}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                {isSignup ? "Get started with your workspace" : "Sign in to manage your workspace"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {isSignup && (
                                <div className="space-y-2">
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

                            <div className="space-y-2">
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

                            <div className="space-y-2">
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
                                <div className="space-y-2">
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

                        <p className="mt-6 text-center text-sm text-gray-500">
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

                {/* Right side: Branding panel */}
                <div className="relative hidden overflow-hidden bg-[#3155e7] p-10 text-white lg:flex lg:flex-col">

                    <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-white/10" />
                    <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-300/20" />

                    <div className="relative z-10 mt-8">
                        <h2 className="text-4xl font-bold leading-tight">
                            Smart tools.
                            <br />
                            Stronger teams.
                        </h2>

                        <p className="mt-3 text-lg text-blue-100">
                            Manage your workspace in one place.
                        </p>
                    </div>

                    <div className="relative z-10 my-auto rounded-2xl bg-white p-5 text-gray-900 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="font-bold">Expinova Dashboard</div>
                            <div className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                                Active
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[["Employees","128"], ["Reports", "42"], ["Teams", "12"]].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <p className="mt-2 text-2xl font-bold">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-3">
                            {[80, 55, 95, 65].map((width, index) => (
                                <div key={index} className="rounded-lg bg-gray-50 p-3">
                                    <div
                                        className="h-3 rounded bg-blue-200"
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 text-center text-sm text-blue-100">
                        A simpler way to manage your business.
                    </div>
                </div>
            </div>
        </div>
    )
}