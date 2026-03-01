"use client";

import DynamicTopNav from "@/components/ui/DynamicTopNav";
import ServiceOrders from "@/components/orders/ServiceOrders";

export default function MyOrdersPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <DynamicTopNav title="My Orders" />

      {/* CONTENT */}
      <ServiceOrders />
    </main>
  );
}
