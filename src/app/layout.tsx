import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PageAurora from "@/components/ui/page-aurora";

export const metadata: Metadata = {
    title: "CampusClaims",
    description: "Find your lost items today!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-dvh font-sans">
                <PageAurora />
                <Navbar />
                <main className="min-h-[calc(100dvh-64px)]">{children}</main>
            </body>
        </html>
    );
}
