"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AxiosResponse } from "axios";
import { Bell, CheckCircle, Truck, Mail, BellRing, Trash2 } from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstance";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCounts } from "@/context/CartNotificationContext";
import DynamicTopNav from "@/components/ui/DynamicTopNav";

interface Notification {
  id: string;
  type: "order" | "promotion" | "system" | "message";
  title: string;
  message?: string;
  created_at: string;
  is_read: boolean;
  meta?: { orderId?: string; discount?: string };
}

const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

const NotificationsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const { refreshNotificationCount } = useCounts();
  const customerId = customer?.public_id;

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/user/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, isAuthenticated, router, pathname]);

  // Fetch notifications
  useEffect(() => {
    if (!customerId) return;

    setLoading(true);
    axiosInstance
      .get(`/api/notifications/${customerId}`)
      .then((res: AxiosResponse<Notification[]>) => setNotifications(res.data))
      .catch(() => setError("Failed to fetch notifications"))
      .finally(() => setLoading(false));
  }, [customerId]);

  const filteredNotifications = notifications.filter(
    (n) => activeTab === "all" || !n.is_read,
  );

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await axiosInstance.patch(`/api/notifications/mark-read/${id}`);
      refreshNotificationCount();
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
    }
  };

  const markAllAsRead = async () => {
    if (!customerId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await axiosInstance.patch(`/api/notifications/mark-all-read/${customerId}`);
    refreshNotificationCount();
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await axiosInstance.delete(`/api/notifications/${id}`);
    refreshNotificationCount();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Truck className="text-blue-500" />;
      case "promotion":
        return <CheckCircle className="text-blue-400" />;
      case "message":
        return <Mail className="text-blue-500" />;
      case "system":
        return <Bell className="text-blue-400" />;
      default:
        return <BellRing className="text-gray-400" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 dark:border-gray-700 rounded-full animate-spin mb-4" />
        <span className="text-gray-700 dark:text-gray-200 text-lg font-medium">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <DynamicTopNav title="Inbox" />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4 text-center shadow-sm">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Bell className="text-white/90" /> Notifications
        </h1>
        <p className="text-sm mt-1 opacity-90">
          Stay updated with your latest alerts
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-5">
          {["all", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "all" | "unread")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-blue-500 text-white shadow"
                  : "bg-white dark:bg-gray-800 border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {tab === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="flex justify-end mb-3">
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-blue-500 hover:text-blue-600"
            >
              Mark all as read
            </button>
          </div>
        )}

        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center bg-white dark:bg-gray-800">
            <BellRing className="mx-auto text-4xl text-gray-300 dark:text-gray-500 mb-3" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">
              No notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              You’re all caught up
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredNotifications.map((n) => (
              <li
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`flex gap-3 rounded-xl border p-4 cursor-pointer transition hover:shadow-sm ${
                  !n.is_read
                    ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/20"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <div className="text-xl mt-1">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {n.title}
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-400">
                      {formatTimeAgo(n.created_at)}
                    </span>
                  </div>

                  {n.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {n.message}
                    </p>
                  )}

                  {n.meta?.orderId && (
                    <span className="inline-block mt-2 rounded bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-200 text-xs px-2 py-0.5">
                      Order #{n.meta.orderId}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
