import { Suspense } from "react";
import PaymentVerifyClient from "./PaymentVerifyClient";

export const dynamic = "force-dynamic";

function LoadingUI() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-sm text-gray-500 animate-pulse">
        Loading verification…
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <PaymentVerifyClient />
    </Suspense>
  );
}
