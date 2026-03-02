import type { Metadata } from "next";
import { ReactNode } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maraspot Services",
  description:
    "Professional web development services by Maraspot. Specializing in React, Next.js, Tailwind CSS, Python & more to create stunning full stack websites and applications. Contact us for custom solutions that elevate your online presence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors duration-300">
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
