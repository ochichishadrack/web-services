import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";

export const metadata: Metadata = {
  title: "Maraspot Services",
  description:
    "Professional web development services by Maraspot. Specializing in React, Next.js, Tailwind CSS, Python & more to create stunning full stack websites and applications.",
  manifest: "/manifest.json",
  icons: { apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ServiceWorker />
        <ThemeProvider>
          <CurrencyProvider>
            <CustomerAuthProvider>
              <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors duration-300">
                <main className="flex-1">{children}</main>
              </div>
            </CustomerAuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
