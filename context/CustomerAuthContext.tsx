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

  // Affiliate helpers
  setReferralCode: (code: string) => void;
  getReferralCode: () => string | null;
  clearReferralCode: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined,
);

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // ---------------------------
  // Referral helpers (24h TTL)
  // ---------------------------

  const REFERRAL_KEY = "referral_data";
  const REFERRAL_TTL = 1000 * 60 * 60 * 24; // 24 hours

  const setReferralCode = (code: string) => {
    if (!code) return;

    const existingRaw = localStorage.getItem(REFERRAL_KEY);

    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw);
        const age = Date.now() - existing.timestamp;

        // If still within 24h, do NOT override
        if (age < REFERRAL_TTL) return;

        // If expired, remove it
        localStorage.removeItem(REFERRAL_KEY);
      } catch {
        localStorage.removeItem(REFERRAL_KEY);
      }
    }

    const data = {
      code,
      timestamp: Date.now(),
    };

    localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
  };

  const getReferralCode = () => {
    const raw = localStorage.getItem(REFERRAL_KEY);
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      const age = Date.now() - data.timestamp;

      // Expire after 24h
      if (age > REFERRAL_TTL) {
        localStorage.removeItem(REFERRAL_KEY);
        return null;
      }

      return data.code;
    } catch {
      localStorage.removeItem(REFERRAL_KEY);
      return null;
    }
  };

  const clearReferralCode = () => {
    localStorage.removeItem(REFERRAL_KEY);
  };

  // ---------------------------
  // Fetch session
  // ---------------------------
  const refreshCustomer = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/session/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

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

  useEffect(() => {
    refreshCustomer();
  }, []);

  // ---------------------------
  // Logout
  // ---------------------------
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
      window.location.replace("/login");
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
        setReferralCode,
        getReferralCode,
        clearReferralCode,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }

  return context;
};
