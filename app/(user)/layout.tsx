"use client";

import { ReactNode } from "react";
import {
  useCustomerAuth,
  CustomerAuthProvider,
} from "@/context/CustomerAuthContext";
import { CartNotificationProvider } from "@/context/CartNotificationContext";

function MainLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated: isCustomer } = useCustomerAuth();

  return (
    <div>
      {isCustomer ? (
        <div className="customer-content">{children}</div>
      ) : (
        <div className="main-content">{children}</div>
      )}
    </div>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartNotificationProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </CartNotificationProvider>
    </CustomerAuthProvider>
  );
}
