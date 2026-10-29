import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Notifications from "@/components/custom-ui/notifications";
import QueryProvider from "@/components/query-provider";

export const metadata: Metadata = {
    title: "Expinova Admin Dashboard",
    description: "Admin management application",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="font-sans antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        {children}
                        <Notifications />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}