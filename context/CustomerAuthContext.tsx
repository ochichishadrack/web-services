"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getApiBaseUrl } from "@/api/api";
import { useRouter } from "next/navigation";

interface Customer {
  public_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone_number_primary?: string;
  created_at?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshCustomer: () => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined
);

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- Fetch session from backend ---
  const refreshCustomer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/session/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        // Map backend response to Customer type

        const customerData: Customer = {
          public_id: data.public_id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar_url: data.avatar_url,
          phone_number_primary: data.phone_number_primary ?? null,
          created_at: data.created_at ?? null,
        };

        setCustomer(customerData);
      } else {
        setCustomer(null);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Initialize on mount ---
  useEffect(() => {
    refreshCustomer();
  }, []);

  // --- Logout ---
  const logout = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setCustomer(null);
      // Full page reload to Login, removing current page from history
      window.location.replace("/user/login");
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        loading,
        refreshCustomer,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context)
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return context;
};
