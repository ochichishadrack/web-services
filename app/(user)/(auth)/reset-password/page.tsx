"use client";

import { useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/api/api";

interface EmailForm {
  email: string;
}

interface ResetForm {
  reset_code: string;
  new_password: string;
}

export default function ResetPassword() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const [emailValue, setEmailValue] = useState("");

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailForm>();

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetForm>();

  const onSubmitEmail: SubmitHandler<EmailForm> = useCallback(async (data) => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/auth/reset-password/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to send reset code");
      }

      setEmailValue(data.email);
      setStep(2);

      setFeedback({
        type: "success",
        message: "Reset code sent to your email.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmitReset: SubmitHandler<ResetForm> = useCallback(
    async (data) => {
      setLoading(true);
      setFeedback(null);

      try {
        const res = await fetch(
          `${getApiBaseUrl()}/api/auth/reset-password/confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: emailValue,
              reset_code: data.reset_code,
              new_password: data.new_password,
            }),
          },
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Reset failed");
        }

        setFeedback({
          type: "success",
          message: "Password reset successful! Redirecting to login...",
        });

        setTimeout(() => router.push("/login"), 2000);
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    },
    [emailValue, router],
  );

  const handleCancel = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="w-full max-w-md">
        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reset Your Password
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your email to receive a reset code
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-6">
          {/* FEEDBACK */}
          {feedback && (
            <div
              className={`text-sm px-4 py-2 rounded-md text-center
              ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {step === 1 ? (
            <form
              onSubmit={handleEmailSubmit(onSubmitEmail)}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div className="relative">
                <input
                  type="email"
                  {...registerEmail("email", { required: "Email is required" })}
                  placeholder=" "
                  className="peer w-full rounded-lg border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-gray-100
                  px-4 pt-5 pb-2 text-sm
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                />

                <label
                  className="absolute left-4 top-2.5 text-gray-500 dark:text-gray-400 text-xs
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                  peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-orange-500"
                >
                  Email
                </label>

                {emailErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {emailErrors.email.message}
                  </p>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600
                  text-white font-semibold py-2 rounded-full text-sm
                  transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Code"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 dark:border-gray-700
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  font-medium py-2 rounded-full text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleResetSubmit(onSubmitReset)}
              className="space-y-5"
            >
              {/* EMAIL READONLY */}
              <div>
                <input
                  type="text"
                  readOnly
                  value={emailValue}
                  className="w-full border border-gray-300 dark:border-gray-700
                  rounded-lg px-4 pt-4 pb-2
                  bg-gray-100 dark:bg-gray-800
                  text-gray-700 dark:text-gray-200 text-sm"
                />
              </div>

              {/* RESET CODE */}
              <div className="relative">
                <input
                  type="text"
                  {...registerReset("reset_code", {
                    required: "Reset code is required",
                  })}
                  placeholder=" "
                  className="peer w-full border border-gray-300 dark:border-gray-700
                  rounded-lg px-4 pt-5 pb-2
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-gray-100 text-sm
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                />

                <label
                  className="absolute left-4 top-2.5 text-gray-500 dark:text-gray-400 text-xs
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                  peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-orange-500"
                >
                  Reset Code
                </label>

                {resetErrors.reset_code && (
                  <p className="text-red-500 text-xs mt-1">
                    {resetErrors.reset_code.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...registerReset("new_password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder=" "
                  className="peer w-full border border-gray-300 dark:border-gray-700
                  rounded-lg px-4 pt-5 pb-2
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-gray-100 text-sm
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                />

                <label
                  className="absolute left-4 top-2.5 text-gray-500 dark:text-gray-400 text-xs
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
                  peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-orange-500"
                >
                  New Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-orange-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                {resetErrors.new_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {resetErrors.new_password.message}
                  </p>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600
                  text-white font-semibold py-2 rounded-full text-sm
                  transition-all disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 dark:border-gray-700
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  font-medium py-2 rounded-full text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
