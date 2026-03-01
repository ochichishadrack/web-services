"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/api/api";
import DynamicTopNav from "../../../components/ui/DynamicTopNav";
import { AnimatePresence, motion } from "framer-motion";

export default function ChangePasswordPage() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id; // ✅ Fixed
  const router = useRouter();
  const apiBaseUrl = getApiBaseUrl();

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/user/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const showBanner = (message: string, type: "success" | "error") => {
    setBanner({ message, type });
    setTimeout(() => setBanner(null), 3000); // auto-dismiss after 3s
  };

  const handleSubmit = async () => {
    if (!customerId) return;

    if (passwordData.new !== passwordData.confirm) {
      showBanner("New passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/customers/change-password/${customerId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwordData),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        showBanner(err?.detail || "Failed to change password", "error");
        return;
      }

      showBanner("Password changed successfully", "success");
      setPasswordData({ current: "", new: "", confirm: "" });
      setTimeout(() => router.push("/user/settings"), 1500);
    } catch (error) {
      console.error("Password change error:", error);
      showBanner("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col items-center">
      {/* Fixed Top Nav */}
      <div className="fixed top-0 left-0 w-full z-50">
        <DynamicTopNav title="Manage Account" />
      </div>

      {/* Centered Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white text-center max-w-sm w-full ${
              banner.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {banner.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <div className="pt-24 px-4 sm:px-6 mt-20 text-gray-600 lg:px-8 w-full max-w-md">
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Change Password
          </h1>

          <input
            type="password"
            name="current"
            placeholder="Current password"
            value={passwordData.current}
            onChange={handlePasswordChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="new"
            placeholder="New password"
            value={passwordData.new}
            onChange={handlePasswordChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="confirm"
            placeholder="Confirm new password"
            value={passwordData.confirm}
            onChange={handlePasswordChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
