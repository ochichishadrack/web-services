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
  ChevronRight,
} from "lucide-react";
import DynamicTopNav from "@/components/ui/DynamicTopNav";

interface ActionButtonProps {
  label: string;
  description: string;
  path: string;
  icon: JSX.Element;
}

const ActionButton = ({
  label,
  description,
  path,
  icon,
}: ActionButtonProps) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(path)}
      className="
        group w-full p-5 rounded-2xl
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        hover:border-orange-300 dark:hover:border-orange-700/60
        hover:shadow-md hover:shadow-orange-500/5
        transition-all duration-200
        flex items-center gap-4 text-left
      "
      type="button"
    >
      <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {label}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors shrink-0" />
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DynamicTopNav title="My Account" />
        <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6 animate-pulse">
          <div className="h-56 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>
      </div>
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
      description: "Track orders and deliveries",
      path: "/projects",
      icon: (
        <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      ),
    },
    {
      label: "Vouchers & Credits",
      description: "View available balances",
      path: "/vouchers",
      icon: <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    },
    {
      label: "Subscriptions",
      description: "Manage your plans",
      path: "/subscription",
      icon: <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    },
    {
      label: "Pending Reviews",
      description: "Rate completed services",
      path: "/pending-reviews",
      icon: <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicTopNav title="My Account" />

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Top actions */}
          <div className="absolute top-5 right-5 flex items-center gap-3 z-10">
            <button
              onClick={() => router.push("/faq")}
              className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/notifications")}
              className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              {/* Avatar */}
              <div
                onClick={handleImageClick}
                className="
                  relative w-24 h-24 rounded-full overflow-hidden
                  bg-orange-100 dark:bg-orange-900/40
                  flex items-center justify-center
                  text-2xl font-bold text-orange-700 dark:text-orange-300
                  cursor-pointer
                  ring-4 ring-orange-500/15
                  hover:ring-orange-500/30 hover:scale-[1.03]
                  transition-all duration-200 shrink-0
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

                <div className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white dark:border-gray-900">
                  <Camera className="w-3.5 h-3.5" />
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
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {customer.first_name} {customer.last_name}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Member since {memberSince}
                </p>

                <button
                  onClick={() => router.push("/settings")}
                  className="mt-2.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition"
                >
                  Edit profile
                </button>
              </div>
            </div>

            {/* Welcome Banner */}
            <div className="mt-7 rounded-xl p-5 sm:p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
              <div>
                <h3 className="text-lg font-semibold">
                  Welcome back, {customer.first_name}
                </h3>
                <p className="text-sm text-orange-50/90 mt-0.5">
                  Manage your services, projects and activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pb-20">
        {accountActions.map((action) => (
          <ActionButton key={action.label} {...action} />
        ))}

        {/* Logout */}
        <div className="md:col-span-2 mt-2">
          <button
            onClick={logout}
            className="
              w-full py-3.5 rounded-xl
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-800
              text-gray-700 dark:text-gray-200
              font-medium text-sm
              hover:bg-gray-50 dark:hover:bg-gray-800
              hover:border-gray-300 dark:hover:border-gray-700
              transition
            "
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
