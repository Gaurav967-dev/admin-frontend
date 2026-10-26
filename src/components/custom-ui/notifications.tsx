"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";

export default function Notifications() {
    const router = useRouter();

    useEffect(() => {
        function handleSessionExpired() {
            router.replace("/");
            router.refresh();
        }

        window.addEventListener(
            "expinova:session-expired",
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                "expinova:session-expired",
                handleSessionExpired
            );
        };
    }, [router]);

    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            visibleToasts={3}
        />
    );
}