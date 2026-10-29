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
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200";

const inputCls =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

const secondaryBtn =
  "flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:border-white/10 dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/5";

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
    <main className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-[#1f2228] dark:text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-2">
        {/* ---------- Brand panel (desktop only) ---------- */}
        <aside className="hidden border-r border-gray-100 bg-gray-50/60 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="text-xl font-semibold tracking-tight">Maraspot</div>

          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
                Welcome back to your projects.
              </h2>
              <p className="mt-3 max-w-md text-base text-gray-500 dark:text-gray-400">
                Pick up right where you left off with your developers.
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
              <h1 className="text-2xl font-bold sm:text-3xl">Welcome back</h1>
              <p className="mt-2 text-sm text-gray-500 sm:text-base dark:text-gray-400">
                Sign in to continue to Maraspot.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
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
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
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
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:hover:bg-white/10 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-[#1f2228]"
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
                <div className="w-full border-t border-gray-100 dark:border-white/10" />
              </div>
              <span className="relative bg-white px-3 text-gray-500 dark:bg-[#1f2228] dark:text-gray-400">
                or
              </span>
            </div>

            <div className="space-y-3">
              <GoogleLoginButton callbackUrl={callbackUrl} />

              <button
                type="button"
                onClick={handleContinueAsGuest}
                className={secondaryBtn}
              >
                Continue as guest
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-gray-900 hover:underline dark:text-white"
              >
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
