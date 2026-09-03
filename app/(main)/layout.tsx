"use client";

import { ReactNode } from "react";
import {
  useCustomerAuth,
  CustomerAuthProvider,
} from "@/context/CustomerAuthContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
function MainLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated: isCustomer } = useCustomerAuth();

  return (
    <>
      <div className=" ">
        {isCustomer ? (
          <div className="customer-content">{children}</div>
        ) : (
          <div className="main-content">{children}</div>
        )}
      </div>
    </>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <AnalyticsTracker />
      <MainLayoutContent>{children}</MainLayoutContent>
    </CustomerAuthProvider>
  );
}
