"use client";

import { useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/api/api";

interface EmailForm {
  email: string;
}

interface ResetForm {
  reset_code: string;
  new_password: string;
}

const BENEFITS = [
  {
    icon: LayoutDashboard,
    title: "Manage every project",
    text: "Track requests, milestones and deliveries from one dashboard.",
  },
  {
    icon: MessageSquare,
    title: "Talk to your developers",
    text: "Share requirements, files and feedback without the back and forth.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    text: "Pay per phase with M-Pesa, card or wallet and keep every receipt.",
  },
];

const labelCls =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200";

const inputCls =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

const primaryBtnCls =
  "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-[#1f2228]";

const secondaryBtnCls =
  "h-11 flex-1 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/5";

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
    <main className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-[#1f2228] dark:text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-2">
        {/* ---------- Brand panel (desktop only) ---------- */}
        <aside className="hidden border-r border-gray-100 bg-gray-50/60 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="text-xl font-semibold tracking-tight">Maraspot</div>

          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
                Locked out? We&apos;ll get you back in.
              </h2>
              <p className="mt-3 max-w-md text-base text-gray-500 dark:text-gray-400">
                Reset your password in two quick steps and return to your
                projects.
              </p>
            </div>

            <ul className="space-y-6">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Maraspot
          </p>
        </aside>

        {/* ---------- Form ---------- */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 text-center text-xl font-semibold tracking-tight lg:hidden">
              Maraspot
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold sm:text-3xl">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-gray-500 sm:text-base dark:text-gray-400">
                {step === 1
                  ? "Enter your email to receive a reset code."
                  : "Enter the code we emailed you and choose a new password."}
              </p>
            </div>

            {feedback && (
              <div
                role="alert"
                className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {step === 1 ? (
              <form
                onSubmit={handleEmailSubmit(onSubmitEmail)}
                noValidate
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelCls}>
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="e.g. john@example.com"
                    disabled={loading}
                    className={inputCls}
                    {...registerEmail("email", {
                      required: "Email is required",
                    })}
                  />
                  {emailErrors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {emailErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className={primaryBtnCls}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send code
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className={secondaryBtnCls}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleResetSubmit(onSubmitReset)}
                noValidate
                className="space-y-5"
              >
                {/* Email (read only) */}
                <div>
                  <label htmlFor="email_readonly" className={labelCls}>
                    Email address
                  </label>
                  <input
                    id="email_readonly"
                    type="text"
                    readOnly
                    value={emailValue}
                    className={`${inputCls} cursor-not-allowed bg-gray-50 text-gray-500 dark:bg-white/[0.03] dark:text-gray-400`}
                  />
                </div>

                {/* Reset code */}
                <div>
                  <label htmlFor="reset_code" className={labelCls}>
                    Reset code
                  </label>
                  <input
                    id="reset_code"
                    type="text"
                    autoComplete="one-time-code"
                    placeholder="Enter the code from your email"
                    disabled={loading}
                    className={inputCls}
                    {...registerReset("reset_code", {
                      required: "Reset code is required",
                    })}
                  />
                  {resetErrors.reset_code && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {resetErrors.reset_code.message}
                    </p>
                  )}
                </div>

                {/* New password */}
                <div>
                  <label htmlFor="new_password" className={labelCls}>
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a new password"
                      disabled={loading}
                      className={`${inputCls} pr-12`}
                      {...registerReset("new_password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:hover:bg-white/10 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {resetErrors.new_password && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {resetErrors.new_password.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className={primaryBtnCls}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset password
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className={secondaryBtnCls}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
