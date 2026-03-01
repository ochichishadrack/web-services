"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { getApiBaseUrl } from "@/api/api";
import { useCustomerAuth } from "@/context/CustomerAuthContext"; // ✅ added

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phonePrimary: string;
  phoneSecondary?: string;
  password: string;
}

export default function Register() {
  const { customer } = useCustomerAuth(); // ✅ auth state

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterForm>();

  // 1️⃣ Get callbackUrl from query and preserve it
  const [callbackUrl, setCallbackUrl] = useState("/account");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cb = params.get("callbackUrl");
    if (cb) setCallbackUrl(cb);
  }, []);

  // 2️⃣ If already logged in → redirect immediately to callbackUrl
  useEffect(() => {
    if (!customer) return;

    // Full reload removes register from history and guarantees fresh auth state
    window.location.replace(callbackUrl);
  }, [customer, callbackUrl]);

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number_primary: data.phonePrimary,
          phone_number_secondary: data.phoneSecondary || null,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Registration failed");

      setFeedback({
        type: "success",
        message: "Account created. Redirecting...",
      });
      reset();

      // 3️⃣ Redirect to Login with callbackUrl preserved
      setTimeout(() => {
        window.location.replace(
          `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      }, 1200);
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-xl text-gray-600 shadow-lg p-5 space-y-4">
          {feedback && (
            <div
              className={`text-xs px-3 py-2 rounded text-center ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {/* Names */}
            <Input
              label="First name"
              error={errors.firstName?.message}
              {...register("firstName", { required: "Required" })}
            />
            <Input
              label="Last name"
              error={errors.lastName?.message}
              {...register("lastName", { required: "Required" })}
            />

            {/* Email */}
            <div className="md:col-span-2">
              <Input
                type="email"
                label="Email address"
                error={errors.email?.message}
                {...register("email", { required: "Required" })}
              />
            </div>

            {/* Phones */}
            <Input
              type="tel"
              label="Primary phone"
              error={errors.phonePrimary?.message}
              {...register("phonePrimary", {
                required: "Required",
                minLength: { value: 7, message: "Invalid" },
              })}
            />
            <Input
              type="tel"
              label="Secondary phone"
              error={errors.phoneSecondary?.message}
              {...register("phoneSecondary")}
            />

            {/* Password */}
            <div className="relative md:col-span-2">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Required",
                  minLength: { value: 6, message: "Min 6 chars" },
                })}
                placeholder=" "
                className="peer w-full rounded-md border border-gray-300 px-3 pt-5 pb-2 text-sm
                focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <label
                className="absolute left-3 top-2.5 text-xs text-gray-500
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white
                text-sm font-medium py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative text-center text-xs">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <span className="relative bg-white px-2 text-gray-500">
              or continue with
            </span>
          </div>

          {/* Google login */}
          <GoogleLoginButton callbackUrl={callbackUrl} />

          <p className="text-center text-xs text-gray-600">
            Already have an account?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-orange-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* Reusable Input */
function Input({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <input
        {...props}
        placeholder=" "
        className="peer w-full rounded-md border border-gray-300 px-3 pt-5 pb-2 text-sm
        focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
      />
      <label
        className="absolute left-3 top-2.5 text-xs text-gray-500
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm"
      >
        {label}
      </label>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
