import type { Metadata } from "next";
import { ReactNode } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";
import InstallAppButton from "@/components/InstallAppButton";

export const metadata: Metadata = {
  title: "Maraspot Services",
  description:
    "Professional web development services by Maraspot. Specializing in React, Next.js, Tailwind CSS, Python & more to create stunning full stack websites and applications.",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>

      <body>
        <ServiceWorker />
        <ThemeProvider>
          <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors duration-300">
            <main className="flex-1">{children}</main>
            <InstallAppButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
