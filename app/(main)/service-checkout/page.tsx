import { Suspense } from "react";
import ServiceCheckoutPage from "./ServiceCheckoutPage";

export default function Page() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <ServiceCheckoutPage />
    </Suspense>
  );
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Loading checkout...</p>
    </div>
  );
}
