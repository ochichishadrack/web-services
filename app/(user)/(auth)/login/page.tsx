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
  AlertTriangle,
} from "lucide-react";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { loginUser } from "@/components/lib/auth";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface LoginForm {
  email: string;
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

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("/account");

  const { refreshCustomer, customer } = useCustomerAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cb = params.get("callbackUrl");
    if (cb) setCallbackUrl(cb);
  }, []);

  useEffect(() => {
    if (!customer) return;

    const hasPhone = Boolean(customer.phone_number_primary);

    if (!hasPhone) {
      window.location.replace("/complete-phone");
    } else {
      // Read straight from the URL so a redirect firing on the same
      // render as the callbackUrl state update never uses the default.
      const params = new URLSearchParams(window.location.search);
      window.location.replace(params.get("callbackUrl") || "/account");
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
                Welcome back to your projects.
              </h2>
              <p className="mt-4 max-w-md text-lg text-orange-50">
                Pick up right where you left off with your developers.
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
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-400">
                  Sign in to continue to Maraspot.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Sign-in failed</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
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
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Password
                    </label>
                    <Link
                      href="/reset-password"
                      className="text-sm font-medium text-orange-600 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={loading}
                      className={`${inputCls} pr-12`}
                      {...register("password", {
                        required: "Password is required",
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
                  className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-orange-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
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
                  or
                </span>
              </div>

              <div className="space-y-3">
                <GoogleLoginButton callbackUrl={callbackUrl} />

                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="h-12 w-full rounded-xl border border-slate-300 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Continue as guest
                </button>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-semibold text-orange-600 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
