// app/(auth)/layout.tsx
import React from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" bg-gray-100 dark:bg-gray-900 min-h-screen">
      {children}
    </div>
  );
}
