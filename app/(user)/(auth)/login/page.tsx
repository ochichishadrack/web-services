"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { loginUser } from "@/components/lib/auth";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const callbackUrlFromQuery = params.get("callbackUrl") || "/user/account";

  const { refreshCustomer, customer } = useCustomerAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);
  }, []);

  useEffect(() => {
    if (!customer) return;

    const hasPhone = Boolean(customer.phone_number_primary);
    const params = new URLSearchParams(window.location.search);
    const callbackUrlFromQuery = params.get("callbackUrl") || "/account";

    if (!hasPhone) {
      window.location.replace("/complete-phone");
    } else {
      window.location.replace(callbackUrlFromQuery);
    }
  }, [customer]);

  const onSubmit: SubmitHandler<LoginForm> = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginUser(email, password);

      if (!result?.success) {
        throw result?.error || "Invalid email or password";
      }

      await refreshCustomer();
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div
        className={`w-full max-w-md transform transition-all duration-700 ease-out
        ${animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow p-8 space-y-6">
          {/* HEADER */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to continue to Maraspot
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="flex gap-3 items-start rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-800 dark:text-red-200"
              role="alert"
            >
              <span className="mt-0.5">⚠</span>
              <div>
                <p className="font-medium">Sign-in failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* EMAIL */}
            <div className="relative">
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder=" "
                className="peer w-full rounded-xl border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                px-4 pt-5 pb-2 text-sm
                focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              />
              <label
                className="absolute left-4 top-2.5 text-xs text-gray-500 dark:text-gray-400
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                peer-focus:top-2.5 peer-focus:text-xs"
              >
                Email address
              </label>

              {errors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                placeholder=" "
                className="peer w-full rounded-xl border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                px-4 pt-5 pb-2 text-sm
                focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              />

              <label
                className="absolute left-4 top-2.5 text-xs text-gray-500 dark:text-gray-400
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                peer-focus:top-2.5 peer-focus:text-xs"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-orange-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-orange-500 to-orange-600
              hover:from-orange-600 hover:to-orange-700 text-white font-medium
              py-2 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative text-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <span className="relative bg-white dark:bg-gray-900 px-2 text-xs text-gray-500 dark:text-gray-400">
              or
            </span>
          </div>

          <GoogleLoginButton callbackUrl={callbackUrlFromQuery} />

          {/* GUEST */}
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full border border-gray-300 dark:border-gray-700
            text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
            font-medium py-2 rounded-xl transition"
          >
            Continue as Guest
          </button>

          {/* LINKS */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?callbackUrl=${encodeURIComponent(
                  callbackUrlFromQuery,
                )}`}
                className="text-orange-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>

            <p className="mt-1">
              <Link
                href="/reset-password"
                className="text-orange-600 hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
