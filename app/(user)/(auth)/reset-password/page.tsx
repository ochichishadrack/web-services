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
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200";

const inputCls =
  "h-[50px] w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20";

const primaryBtnCls =
  "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-orange-500/30";

const secondaryBtnCls =
  "h-12 flex-1 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";

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
    <main className="min-h-screen bg-slate-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-2">
        {/* ---------- Brand panel (desktop only) ---------- */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-black/10"
          />

          <div className="relative text-2xl font-bold tracking-tight">
            Maraspot
          </div>

          <div className="relative space-y-10">
            <div>
              <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
                Locked out? We&apos;ll get you back in.
              </h2>
              <p className="mt-4 max-w-md text-lg text-orange-50">
                Reset your password in two quick steps and return to your
                projects.
              </p>
            </div>

            <ul className="space-y-6">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-0.5 text-sm text-orange-50">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-sm text-orange-100">
            &copy; {new Date().getFullYear()} Maraspot
          </p>
        </aside>

        {/* ---------- Form ---------- */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            {/* Mobile brand */}
            <div className="mb-6 text-center text-2xl font-bold tracking-tight text-orange-600 lg:hidden">
              Maraspot
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-gray-900">
              <div className="mb-6 text-center sm:mb-8 sm:text-left">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
                  Reset your password
                </h1>
                <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-400">
                  {step === 1
                    ? "Enter your email to receive a reset code."
                    : "Enter the code we emailed you and choose a new password."}
                </p>
              </div>

              {feedback && (
                <div
                  role="alert"
                  className={`mb-6 rounded-xl px-4 py-3 text-center text-sm ${
                    feedback.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {step === 1 ? (
                <form
                  onSubmit={handleEmailSubmit(onSubmitEmail)}
                  noValidate
                  className="space-y-4 sm:space-y-5"
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
                      <p className="mt-1 text-xs text-red-600">
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
                  className="space-y-4 sm:space-y-5"
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
                      className={`${inputCls} cursor-not-allowed bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`}
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
                      <p className="mt-1 text-xs text-red-600">
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
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {resetErrors.new_password && (
                      <p className="mt-1 text-xs text-red-600">
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
          </div>
        </section>
      </div>
    </main>
  );
}
