"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import Head from "next/head";
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
  // Get callbackUrl from query
  const params = new URLSearchParams(window.location.search);
  const callbackUrlFromQuery = params.get("callbackUrl") || "/user/account";

  const { refreshCustomer, customer } = useCustomerAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // After login
  useEffect(() => {
    if (!customer) return; // wait for context to update

    const hasPhone = Boolean(customer.phone_number_primary);

    // Get callbackUrl from query
    const params = new URLSearchParams(window.location.search);
    const callbackUrlFromQuery = params.get("callbackUrl") || "/account";

    if (!hasPhone) {
      // Full browser refresh to complete phone page
      window.location.replace("/complete-phone");
    } else {
      // Full browser refresh to account or callbackUrl
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
      // ❌ DO NOT redirect here
      // The useEffect above will handle the redirect
    } catch (err: unknown) {
      console.error(err);
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
    // Full browser reload to home, removing Login from history
    window.location.replace("/");
  };

  return (
    <>
      <Head>
        <title>Sign in | Maraspot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            {/* Error */}
            {error && (
              <div
                className="flex gap-3 items-start rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 animate-fadeIn"
                role="alert"
              >
                <span className="mt-0.5 text-red-500">⚠</span>
                <div>
                  <p className="font-medium">Sign-in failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="relative">
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  placeholder=" "
                  className="peer w-full text-gray-900 rounded-md border border-gray-300 px-3 pt-5 pb-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
                <label className="absolute left-3 top-2.5 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-xs">
                  Email address
                </label>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  placeholder=" "
                  className="peer w-full text-gray-900 rounded-md border border-gray-300 px-3 pt-5 pb-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
                <label className="absolute left-3 top-2.5 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-xs">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-orange-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <span className="relative bg-white px-2 text-xs text-gray-500">
                or
              </span>
            </div>

            <GoogleLoginButton callbackUrl={callbackUrlFromQuery} />

            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 rounded-md transition"
            >
              Continue as Guest
            </button>

            <div className="text-center text-sm text-gray-600">
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
    </>
  );
}
