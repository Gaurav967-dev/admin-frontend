import Link from "next/link";
import { FileTextIcon } from "@/components/icons/file-text";

import SignInForm from "../form/sign-in-form";
import SignUpForm from "../form/sign-up-form";
import AuthStatsPanel from "../components/auth-stats-panel";

type AuthContainerProps = {
    mode: "signin" | "signup";
};

export default function AuthContainer({
    mode,
}: AuthContainerProps) {
    const isSignup = mode === "signup";

    return (
        <div className="min-h-dvh bg-[#f3f4f8] p-2 sm:p-1 md:h-dvh md:overflow-hidden">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-2xl bg-white md:h-full md:min-h-0 md:grid-cols-2 md:grid-rows-1">

                {/* Left: Authentication panel */}
                <div className="flex min-w-0 flex-col bg-white px-4 py-5 sm:px-7 md:min-h-0 md:overflow-y-auto md:px-6 lg:px-10 xl:px-14">

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

                    {/* Form */}
                    <div className="my-auto mx-auto w-full max-w-sm py-6 md:py-4">
                        <div className="mb-4 text-center">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isSignup
                                    ? "Create your account"
                                    : "Welcome back"}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                {isSignup
                                    ? "Get started with your workspace"
                                    : "Sign in to manage your workspace"}
                            </p>
                        </div>

                        {isSignup ? <SignUpForm /> : <SignInForm />}

                        <p className="mt-4 text-center text-sm text-gray-500">
                            {isSignup
                                ? "Already have an account?"
                                : "Don't have an account?"}{" "}

                            <Link
                                href={isSignup ? "/" : "/sign-up"}
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                {isSignup ? "Sign in" : "Sign up"}
                            </Link>
                        </p>
                    </div>

                    {/* Conditional footer */}
                    <footer className="mt-8 shrink-0 px-2 text-center text-[11px] leading-relaxed text-gray-400 md:mt-0">
                        {isSignup ? (
                            <p>
                                By creating an account, you agree to our{" "}
                                <span className="font-medium text-slate-600 underline underline-offset-2">
                                    Terms of Service
                                </span>{" "}
                                and{" "}
                                <span className="font-medium text-slate-600 underline underline-offset-2">
                                    Privacy Policy
                                </span>
                                .
                            </p>
                        ) : (
                            <p>
                                © 2026 Expinova. All rights reserved.
                            </p>
                        )}
                    </footer>

                </div>

                {/* Right: Branding and statistics */}
                <AuthStatsPanel />

            </div>
        </div>
    );
}