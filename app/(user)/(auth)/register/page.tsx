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
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200";

const inputCls =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

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
    <main className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-[#1f2228] dark:text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-2">
        {/* ---------- Brand panel (desktop only) ---------- */}
        <aside className="hidden border-r border-gray-100 bg-gray-50/60 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="text-xl font-semibold tracking-tight">Maraspot</div>

          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
                Build your next project with Maraspot developers.
              </h2>
              <p className="mt-3 max-w-md text-base text-gray-500 dark:text-gray-400">
                Hire, track and pay for development work in one place.
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
          <div className="w-full max-w-lg">
            {/* Mobile brand */}
            <div className="mb-8 text-center text-xl font-semibold tracking-tight lg:hidden">
              Maraspot
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-gray-500 sm:text-base dark:text-gray-400">
                Join Maraspot and start managing your projects.
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

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
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
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 dark:focus-visible:ring-offset-[#1f2228]"
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
                <div className="w-full border-t border-gray-100 dark:border-white/10" />
              </div>
              <span className="relative bg-white px-3 text-gray-500 dark:bg-[#1f2228] dark:text-gray-400">
                or continue with
              </span>
            </div>

            <GoogleLoginButton callbackUrl={callbackUrl} />

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-gray-900 hover:underline dark:text-white"
              >
                Sign in
              </Link>
            </p>
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
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
