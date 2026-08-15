"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRouter, usePathname } from "next/navigation";
import { getApiBaseUrl } from "@/api/api";
import DynamicTopNav from "@/components/ui/DynamicTopNav";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ChangePasswordPage() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id;
  const router = useRouter();
  const pathname = usePathname();
  const apiBaseUrl = getApiBaseUrl();

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname || "/change-password");
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [authLoading, isAuthenticated, router, pathname]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const showBanner = (message: string, type: "success" | "error") => {
    setBanner({ message, type });
    setTimeout(() => setBanner(null), 3500);
  };

  const handleSubmit = async () => {
    if (!customerId) return;

    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      showBanner("Please fill in all fields", "error");
      return;
    }

    if (passwordData.new.length < 8) {
      showBanner("New password must be at least 8 characters", "error");
      return;
    }

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
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        showBanner(err?.detail || "Failed to change password", "error");
        return;
      }

      showBanner("Password changed successfully", "success");
      setPasswordData({ current: "", new: "", confirm: "" });
      setTimeout(() => router.push("/settings"), 1500);
    } catch (error) {
      console.error("Password change error:", error);
      showBanner("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="Change Password" />
        <div className="max-w-md mx-auto px-4 sm:px-6 py-10 animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto" />
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
              </div>
            ))}
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl mt-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="Change Password" />

      {/* Toast Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className={`
              fixed top-20 left-1/2 -translate-x-1/2 z-50
              px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
              text-center max-w-sm w-[90%]
              ${banner.type === "success" ? "bg-emerald-500" : "bg-red-500"}
            `}
          >
            {banner.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Change Password
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Keep your account secure
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">
            <PasswordField
              label="Current Password"
              name="current"
              value={passwordData.current}
              show={showPassword.current}
              onChange={handlePasswordChange}
              onToggle={() => toggleVisibility("current")}
            />

            <PasswordField
              label="New Password"
              name="new"
              value={passwordData.new}
              show={showPassword.new}
              onChange={handlePasswordChange}
              onToggle={() => toggleVisibility("new")}
              hint="At least 8 characters"
            />

            <PasswordField
              label="Confirm New Password"
              name="confirm"
              value={passwordData.confirm}
              show={showPassword.confirm}
              onChange={handlePasswordChange}
              onToggle={() => toggleVisibility("confirm")}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`
                w-full py-3.5 rounded-xl font-semibold text-sm transition mt-2
                ${
                  loading
                    ? "bg-orange-300 dark:bg-orange-800/50 text-white cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                }
              `}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  show,
  onChange,
  onToggle,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  show: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className="
            w-full px-4 py-3 pr-12
            bg-white dark:bg-gray-950
            border border-gray-200 dark:border-gray-700
            rounded-xl
            text-gray-900 dark:text-white
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
            transition
          "
          placeholder={label}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && (
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
