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
        <div className="min-h-dvh bg-[#f7f8fc] p-2 sm:p-3 md:h-dvh md:overflow-hidden">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-2xl bg-white md:h-full md:min-h-0 md:grid-cols-2 md:grid-rows-1">

                {/* Left: authentication form */}
                <div className="flex min-w-0 flex-col px-4 py-5 sm:px-7 md:min-h-0 md:overflow-y-auto md:px-6 lg:px-10 xl:px-14">

                    {/* Branding */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6048ce] text-white">
                            <FileTextIcon
                                size={22}
                                className="flex size-[22px] items-center justify-center"
                            />
                        </div>

                        <span className="text-2xl font-semibold tracking-tight text-[#6048ce]">Expinova</span>
                    </div>

                    {/* Page heading and form */}
                    <div className="my-auto mx-auto w-full max-w-sm py-3 md:py-4">

                        <div className="mb-4 text-center">
                            <h1 className="text-3xl font-bold tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</h1>

                            <p className="mt-2 text-sm text-gray-500">{isSignup ? "Get started with your workspace" : "Sign in to manage your workspace"}</p>
                        </div>

                        {isSignup ? <SignUpForm /> : <SignInForm />}

                        <p className="mt-4 text-center text-sm text-gray-500">
                            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                            <Link
                                href={isSignup ? "/" : "/sign-up"}
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                {isSignup ? "Sign in" : "Sign up"}
                            </Link>
                        </p>
                    </div>

                    <p className="hidden text-center text-xs text-gray-400 md:block">© 2026 Expinova. All rights reserved.</p>
                </div>

                {/* Right: existing stats panel */}
                <AuthStatsPanel />

                {/* Mobile footer */}
                <footer className="bg-white px-4 py-5 text-center text-xs text-gray-400 md:hidden">© 2026 Expinova. All rights reserved.</footer>
            </div>
        </div>
    );
}