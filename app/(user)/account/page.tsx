"use client";

import { useRef, ChangeEvent, JSX, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import {
  Settings,
  HelpCircle,
  Bell,
  ShoppingBag,
  Star,
  Gift,
  Camera,
} from "lucide-react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";

interface ActionButtonProps {
  label: string;
  path: string;
  icon?: JSX.Element;
}

const ActionButton = ({ label, path, icon }: ActionButtonProps) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(path)}
      className="
        group w-full p-5 rounded-xl
        bg-white dark:bg-slate-800
        border border-gray-200 dark:border-slate-700
        hover:border-indigo-500 dark:hover:border-indigo-400
        hover:shadow-lg transition
        flex items-center gap-4 text-left
      "
      type="button"
    >
      <div className="w-11 h-11 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Open {label.toLowerCase()}
        </p>
      </div>
    </button>
  );
};

export default function CustomerAccount() {
  const { customer, logout, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !customer) {
      router.replace("/login");
    }
  }, [authLoading, customer, router]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !customer) return;

    const form = new FormData();
    form.append("file", e.target.files[0]);

    const res = await fetch(
      `/api/customers/upload-image/${customer.public_id}`,
      {
        method: "POST",
        body: form,
        credentials: "include",
      },
    );

    if (res.ok) router.refresh();
  };

  if (authLoading || !customer) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 animate-pulse" />
    );
  }

  const memberSince = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const accountActions = [
    {
      label: "My Projects",
      path: "/projects",
      icon: (
        <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      ),
    },
    {
      label: "Vouchers & Credits",
      path: "/vouchers",
      icon: <Gift className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      label: "Pending Reviews",
      path: "/pending-reviews",
      icon: <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <DynamicTopNav title="My Account" />

      {/* Header Card */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div
          className="
          relative overflow-hidden rounded-2xl
          bg-white/80 dark:bg-slate-900/80
          backdrop-blur border border-gray-200 dark:border-slate-800
          shadow-sm
        "
        >
          {/* Header actions */}
          <div className="absolute top-5 right-5 flex gap-4">
            <HelpCircle
              className="w-5 h-5 cursor-pointer text-gray-500 dark:text-gray-300 hover:text-indigo-500"
              onClick={() => router.push("/faq")}
            />
            <Settings
              className="w-5 h-5 cursor-pointer text-gray-500 dark:text-gray-300 hover:text-indigo-500"
              onClick={() => router.push("/settings")}
            />
          </div>

          <div className="p-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div
                onClick={handleImageClick}
                className="
                  relative w-24 h-24 rounded-full overflow-hidden
                  bg-slate-200 dark:bg-slate-700
                  flex items-center justify-center
                  text-3xl font-bold
                  cursor-pointer
                  ring-4 ring-indigo-500/20
                  hover:scale-105 transition
                "
              >
                {customer.avatar_url ? (
                  <Image
                    src={customer.avatar_url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>
                    {(customer.first_name?.[0] || "").toUpperCase()}
                    {(customer.last_name?.[0] || "").toUpperCase()}
                  </span>
                )}

                <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow">
                  <Camera className="w-4 h-4" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {customer.first_name} {customer.last_name}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {memberSince}
                </p>

                <button
                  onClick={() => router.push("/settings")}
                  className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Edit profile
                </button>
              </div>

              <Bell
                className="w-6 h-6 cursor-pointer text-gray-500 dark:text-gray-300 hover:text-indigo-500"
                onClick={() => router.push("/notifications")}
              />
            </div>

            {/* Welcome Banner */}
            <div
              className="
              mt-8 rounded-xl p-6
              bg-linear-to-r from-indigo-600 to-indigo-500
              text-white flex items-center justify-between
              shadow-md
            "
            >
              <div>
                <h3 className="text-lg font-semibold">
                  Welcome back, {customer.first_name}
                </h3>
                <p className="text-sm opacity-90">
                  Manage your services, projects and activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 pb-20">
        {accountActions.map((action) => (
          <ActionButton key={action.label} {...action} />
        ))}

        <div
          className="
          md:col-span-2
          bg-white dark:bg-slate-900
          border border-gray-200 dark:border-slate-800
          rounded-xl p-4
        "
        >
          <button
            onClick={logout}
            className="
              w-full py-3 rounded-lg
              bg-gray-900 dark:bg-white
              text-white dark:text-black
              font-semibold
              hover:opacity-90 transition
            "
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
