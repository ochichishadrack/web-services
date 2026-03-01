"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { axiosInstance } from "@/utils/axiosInstance";
import { useCustomerAuth } from "./CustomerAuthContext";

interface Counts {
  cartCount: number;
  wishlistCount: number;
  notificationCount: number;
  refreshCounts: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
  refreshWishlistCount: () => Promise<void>;
  refreshNotificationCount: () => Promise<void>;
}

const CartNotificationContext = createContext<Counts | undefined>(undefined);

export const CartNotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { customer, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id;

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchedOnce = useRef(false);

  const refreshCartCount = async () => {
    if (!customerId) return;
    try {
      const res = await axiosInstance.get(`/api/cart/${customerId}/count`);
      setCartCount(res.data);
    } catch (error) {
      console.error("Failed to refresh cart count:", error);
    }
  };

  // ✅ UPDATED wishlist count logic to use `res.data.count`
  const refreshWishlistCount = async () => {
    if (!customerId) return;
    try {
      const res = await axiosInstance.get(`/api/wishlist/${customerId}/count`);
      setWishlistCount(res.data.count ?? 0); // ✅ FIXED
    } catch (error) {
      console.error("Failed to refresh wishlist count:", error);
    }
  };

  const refreshNotificationCount = async () => {
    if (!customerId) return;
    try {
      const res = await axiosInstance.get(
        `/api/notifications/unread-count/${customerId}`,
      );
      setNotificationCount(res.data);
    } catch (error) {
      console.error("Failed to refresh notification count:", error);
    }
  };

  const refreshCounts = async () => {
    await Promise.all([
      refreshCartCount(),
      refreshWishlistCount(),
      refreshNotificationCount(),
    ]);
  };

  useEffect(() => {
    if (!customerId || fetchedOnce.current) return;

    fetchedOnce.current = true;
    refreshCounts();

    window.addEventListener("focus", refreshCounts);
    return () => window.removeEventListener("focus", refreshCounts);
  }, [customerId]);

  if (authLoading) return null;

  return (
    <CartNotificationContext.Provider
      value={{
        cartCount,
        wishlistCount,
        notificationCount,
        refreshCounts,
        refreshCartCount,
        refreshWishlistCount,
        refreshNotificationCount,
      }}
    >
      {children}
    </CartNotificationContext.Provider>
  );
};

export const useCounts = (): Counts => {
  const context = useContext(CartNotificationContext);
  if (!context) {
    throw new Error("useCounts must be used within a CartNotificationProvider");
  }
  return context;
};
