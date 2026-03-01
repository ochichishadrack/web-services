"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRouter } from "next/navigation";
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
  const apiBaseUrl = getApiBaseUrl();

  const [localCustomer, setLocalCustomer] = useState<Customer | null>(null);
  const [originalCustomer, setOriginalCustomer] = useState<Customer | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/user/login");
      return;
    }

    if (!customerId) return;

    const fetchCustomer = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/customers/${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch customer");
        const data: Customer = await res.json();
        setLocalCustomer(data);
        setOriginalCustomer(data);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [authLoading, isAuthenticated, customerId, apiBaseUrl, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 dark:text-gray-300 text-base">
          Loading profile...
        </p>
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
    if (!localCustomer || !customerId) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localCustomer),
      });

      if (!res.ok) throw new Error("Failed to update account info");

      alert("Account updated successfully");
      setOriginalCustomer(localCustomer);
    } catch (err) {
      console.error(err);
      alert("Failed to update account info");
    }
  };

  const handleDeleteAccount = async () => {
    if (!customerId) return;
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      alert("Account deleted successfully");
      window.location.replace("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <DynamicTopNav title="Manage Account" />

      <div className="px-4 sm:px-6 lg:px-6 py-8 max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-5">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Edit Account
          </h1>

          <div className="space-y-4">
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

            <InputField
              label="Email"
              type="email"
              name="email"
              value={localCustomer.email}
              onChange={handleInputChange}
            />

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

          {hasChanges && (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition"
            >
              Save Changes
            </button>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
            <Link
              href="/change-password"
              className="block text-center w-full py-3 bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              Change Password
            </Link>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Delete Account
            </button>
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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
    </div>
  );
}
