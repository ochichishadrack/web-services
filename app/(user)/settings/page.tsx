"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRouter, usePathname } from "next/navigation";
import { getApiBaseUrl } from "@/api/api";
import Link from "next/link";
import DynamicTopNav from "@/components/ui/DynamicTopNav";

interface Customer {
  id: number;
  public_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number_primary?: string;
  phone_number_secondary?: string;
}

export default function AccountManagement() {
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const customerId = customer?.public_id;
  const router = useRouter();
  const pathname = usePathname();
  const apiBaseUrl = getApiBaseUrl();

  const [localCustomer, setLocalCustomer] = useState<Customer | null>(null);
  const [originalCustomer, setOriginalCustomer] = useState<Customer | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname || "/settings");
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!customerId) return;

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/api/customers/${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch customer");
        const data: Customer = await res.json();
        setLocalCustomer(data);
        setOriginalCustomer(data);
      } catch (err) {
        console.error(err);
        const callbackUrl = encodeURIComponent(pathname || "/settings");
        router.replace(`/login?callbackUrl=${callbackUrl}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [authLoading, isAuthenticated, customerId, apiBaseUrl, router, pathname]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="Account Settings" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-11 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-11 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
            <div className="h-12 w-full sm:w-48 bg-gray-200 dark:bg-gray-800 rounded-xl mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!localCustomer) return null;

  const hasChanges =
    localCustomer.first_name !== originalCustomer?.first_name ||
    localCustomer.last_name !== originalCustomer?.last_name ||
    localCustomer.email !== originalCustomer?.email ||
    localCustomer.phone_number_primary !==
      originalCustomer?.phone_number_primary ||
    localCustomer.phone_number_secondary !==
      originalCustomer?.phone_number_secondary;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalCustomer((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!localCustomer || !customerId || saving) return;

    try {
      setSaving(true);
      const res = await fetch(`${apiBaseUrl}/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localCustomer),
      });

      if (!res.ok) throw new Error("Failed to update account info");

      setOriginalCustomer(localCustomer);
      alert("Account updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update account info");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!customerId || deleting) return;

    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const res = await fetch(`${apiBaseUrl}/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      alert("Account deleted successfully");
      window.location.replace("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="Account Settings" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Edit Account
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              Update your personal information and contact details.
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Name fields - side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField
                label="First Name"
                name="first_name"
                value={localCustomer.first_name}
                onChange={handleInputChange}
              />
              <InputField
                label="Last Name"
                name="last_name"
                value={localCustomer.last_name}
                onChange={handleInputChange}
              />
            </div>

            <InputField
              label="Email"
              type="email"
              name="email"
              value={localCustomer.email}
              onChange={handleInputChange}
            />

            {/* Phone fields - side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField
                label="Primary Phone"
                type="tel"
                name="phone_number_primary"
                value={localCustomer.phone_number_primary || ""}
                onChange={handleInputChange}
              />
              <InputField
                label="Secondary Phone (optional)"
                type="tel"
                name="phone_number_secondary"
                value={localCustomer.phone_number_secondary || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`
                  w-full sm:w-auto sm:min-w-[180px] py-3.5 px-8 rounded-xl font-semibold text-sm transition
                  ${
                    hasChanges && !saving
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {hasChanges && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center sm:text-left">
                  You have unsaved changes
                </p>
              )}
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/change-password"
                  className="
                    flex items-center justify-center flex-1 py-3.5 rounded-xl
                    bg-white dark:bg-gray-900
                    border border-gray-200 dark:border-gray-700
                    text-gray-800 dark:text-gray-200
                    font-medium text-sm
                    hover:bg-gray-50 dark:hover:bg-gray-800
                    hover:border-gray-300 dark:hover:border-gray-600
                    transition
                  "
                >
                  Change Password
                </Link>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="
                    flex-1 py-3.5 rounded-xl
                    bg-red-50 dark:bg-red-900/20
                    border border-red-200 dark:border-red-800/50
                    text-red-600 dark:text-red-400
                    font-medium text-sm
                    hover:bg-red-100 dark:hover:bg-red-900/30
                    transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  name,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full px-4 py-3
          bg-white dark:bg-gray-950
          border border-gray-200 dark:border-gray-700
          rounded-xl
          text-gray-900 dark:text-white
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
          transition
        "
      />
    </div>
  );
}
