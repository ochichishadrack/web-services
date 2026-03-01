import { Suspense } from "react";
import ServiceCheckoutPage from "./ServiceCheckoutPage";

export default function Page() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Suspense fallback={<CheckoutLoading />}>
        <ServiceCheckoutPage />
      </Suspense>
    </main>
  );
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors">
      <p className="text-gray-500 dark:text-gray-400">Loading checkout...</p>
    </div>
  );
}
