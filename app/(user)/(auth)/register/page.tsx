"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
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

export default function Register() {
  const { customer } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/account");
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cb = params.get("callbackUrl");
    if (cb) setCallbackUrl(cb);
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
                Build your next project with Maraspot developers.
              </h2>
              <p className="mt-4 max-w-md text-lg text-orange-50">
                Hire, track and pay for development work in one place.
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
                  Create your account
                </h1>
                <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-400">
                  Join Maraspot and start managing your projects.
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

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
              >
                <Field
                  label="First name"
                  placeholder="e.g. John"
                  autoComplete="given-name"
                  disabled={loading}
                  error={errors.firstName?.message}
                  {...register("firstName", { required: "Required" })}
                />

                <Field
                  label="Last name"
                  placeholder="e.g. Doe"
                  autoComplete="family-name"
                  disabled={loading}
                  error={errors.lastName?.message}
                  {...register("lastName", { required: "Required" })}
                />

                <div className="sm:col-span-2">
                  <Field
                    type="email"
                    label="Email address"
                    placeholder="e.g. john@example.com"
                    autoComplete="email"
                    inputMode="email"
                    disabled={loading}
                    error={errors.email?.message}
                    {...register("email", { required: "Required" })}
                  />
                </div>

                <Field
                  type="tel"
                  label="Primary phone"
                  placeholder="e.g. +254712345678"
                  autoComplete="tel"
                  disabled={loading}
                  error={errors.phonePrimary?.message}
                  {...register("phonePrimary", {
                    required: "Required",
                    minLength: { value: 7, message: "Invalid" },
                  })}
                />

                <Field
                  type="tel"
                  label="Secondary phone (optional)"
                  placeholder="e.g. +254798765432"
                  disabled={loading}
                  error={errors.phoneSecondary?.message}
                  {...register("phoneSecondary")}
                />

                {/* Password */}
                <div className="sm:col-span-2">
                  <label htmlFor="password" className={labelCls}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      disabled={loading}
                      className={`${inputCls} pr-12`}
                      {...register("password", {
                        required: "Required",
                        minLength: { value: 6, message: "Min 6 chars" },
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
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 dark:focus:ring-orange-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center text-xs">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <span className="relative bg-white px-3 text-slate-500 dark:bg-gray-900 dark:text-slate-400">
                  or continue with
                </span>
              </div>

              <GoogleLoginButton callbackUrl={callbackUrl} />

              <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-semibold text-orange-600 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={props.name} className={labelCls}>
        {label}
      </label>
      <input id={props.name} {...props} className={inputCls} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
