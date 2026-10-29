"use client";

import DynamicTopNav from "@/components/ui/DynamicTopNav";
import ServiceOrders from "@/components/orders/ServiceOrders";

export default function MyOrdersPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-[#1f2228] dark:text-white">
      <DynamicTopNav title="Orders" />

      {/* CONTENT */}
      <ServiceOrders />
    </main>
  );
}
