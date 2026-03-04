"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { getApiBaseUrl } from "@/api/api";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phonePrimary: string;
  phoneSecondary?: string;
  password: string;
}

export default function Register() {
  const { customer } = useCustomerAuth();
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
  const [callbackUrl, setCallbackUrl] = useState("/account");

  // Card animation state
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cb = params.get("callbackUrl");
    if (cb) setCallbackUrl(cb);

    // Trigger entrance animation
    setTimeout(() => setAnimate(true), 50);
  }, []);

  useEffect(() => {
    if (!customer) return;
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
      <div
        className={`w-full max-w-lg transform transition-all duration-700 ease-out
          ${animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Join Maraspot and start managing your services
          </p>

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
            className="grid grid-cols-1 text-gray-700 sm:grid-cols-2 md:grid-cols-2 gap-4"
          >
            <Input
              label="First Name"
              error={errors.firstName?.message}
              {...register("firstName", { required: "Required" })}
            />
            <Input
              label="Last Name"
              error={errors.lastName?.message}
              {...register("lastName", { required: "Required" })}
            />
            <div className="md:col-span-2">
              <Input
                type="email"
                label="Email Address"
                error={errors.email?.message}
                {...register("email", { required: "Required" })}
              />
            </div>
            <Input
              type="tel"
              label="Primary Phone"
              error={errors.phonePrimary?.message}
              {...register("phonePrimary", {
                required: "Required",
                minLength: { value: 7, message: "Invalid" },
              })}
            />
            <Input
              type="tel"
              label="Secondary Phone"
              error={errors.phoneSecondary?.message}
              {...register("phoneSecondary")}
            />
            <div className="relative md:col-span-2">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Required",
                  minLength: { value: 6, message: "Min 6 chars" },
                })}
                placeholder=" "
                className="peer w-full rounded-xl border border-gray-300 px-4 pt-5 pb-2 text-sm
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              />
              <label
                className="absolute left-4 top-2.5 text-xs text-gray-500
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-xs"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-orange-600 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-orange-500 to-orange-600
                  hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium py-2 rounded-xl disabled:opacity-50 transition-all"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="relative text-center text-xs my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <span className="relative bg-white px-2 text-gray-500">
              or continue with
            </span>
          </div>

          <GoogleLoginButton callbackUrl={callbackUrl} />

          <p className="text-center text-xs text-gray-600 mt-2">
            Already have an account?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-orange-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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
        className="peer w-full rounded-xl border border-gray-300 px-4 pt-5.5 pb-2 text-sm
          focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
      />
      <label
        className="absolute left-4 top-2.5 text-xs text-gray-500
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-xs"
      >
        {label}
      </label>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
