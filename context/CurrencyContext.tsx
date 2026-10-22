// context/CurrencyContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { axiosInstance } from "@/utils/axiosInstance";

export interface Country {
  code: string;
  name: string | null;
  flag: string | null;
  currency: string;
  calling_code?: string | null;
}

interface CurrencyState {
  country: string;
  countryName: string | null;
  flag: string | null;
  currency: string;
  rate: number;
  callingCode: string | null;
}

interface CurrencyContextValue extends CurrencyState {
  loading: boolean;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
  selectCountry: (country: Country) => Promise<void>;
  refresh: () => Promise<void>;
}

const STORAGE_KEY = "app_currency_v1";

/** Public API origin for IP-based routes (browser → API, not Docker hop). */
const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(
  /\/$/,
  "",
);

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

// -----------------------------------------------------
// localStorage (only after user manually selects a country)
// -----------------------------------------------------

function readStoredState(): CurrencyState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      !parsed?.country ||
      typeof parsed.country !== "string" ||
      !parsed.currency ||
      typeof parsed.currency !== "string"
    ) {
      return null;
    }

    return {
      country: parsed.country.toUpperCase(),
      countryName: parsed.countryName ?? null,
      flag: parsed.flag ?? null,
      currency: parsed.currency.toUpperCase(),
      rate:
        typeof parsed.rate === "number" && Number.isFinite(parsed.rate)
          ? parsed.rate
          : 1,
      callingCode: parsed.callingCode ?? null,
    };
  } catch {
    return null;
  }
}

function writeStoredState(state: CurrencyState) {
  if (typeof window === "undefined") return;
  if (!state.country || !state.currency) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function mapForMeResponse(data: Record<string, unknown>): CurrencyState {
  const country = String(data.country ?? "").toUpperCase();
  const currency = String(data.currency ?? "USD").toUpperCase();
  const rate =
    typeof data.rate === "number" && Number.isFinite(data.rate) ? data.rate : 1;

  return {
    country,
    countryName: (data.country_name as string | null) ?? null,
    flag: (data.flag as string | null) ?? null,
    currency,
    rate,
    callingCode: (data.calling_code as string | null) ?? null,
  };
}

// -----------------------------------------------------
// Provider
// -----------------------------------------------------

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrencyState | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------
  // IP detection — prefer public API URL so backend sees real client IP
  // ---------------------------------------------------

  const fetchFromServer = useCallback(async () => {
    setLoading(true);

    try {
      // Browser → public API (real IP). Fallback to same-origin proxy if unset.
      const url = PUBLIC_API_URL
        ? `${PUBLIC_API_URL}/currency/for-me`
        : "/api/currency/for-me";

      const res = PUBLIC_API_URL
        ? await fetch(url, {
            method: "GET",
            credentials: "omit",
            cache: "no-store",
          })
        : null;

      let data: Record<string, unknown>;

      if (res) {
        if (!res.ok) {
          throw new Error(`for-me failed: ${res.status}`);
        }
        data = (await res.json()) as Record<string, unknown>;
      } else {
        const axiosRes = await axiosInstance.get("/api/currency/for-me");
        data = axiosRes.data as Record<string, unknown>;
      }

      const next = mapForMeResponse(data);

      if (!next.country) {
        throw new Error("Backend returned no country");
      }

      setState(next);
      // Do not persist auto-detect — only user picks go to localStorage
    } catch (error) {
      console.error("Failed to fetch currency from backend:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------
  // Mount: always detect via backend (no hardcoded country)
  // ---------------------------------------------------

  useEffect(() => {
    void fetchFromServer();
  }, [fetchFromServer]);

  // ---------------------------------------------------
  // User manually selects a country
  // ---------------------------------------------------

  const selectCountry = useCallback(async (country: Country) => {
    const optimistic: CurrencyState = {
      country: country.code.toUpperCase(),
      countryName: country.name,
      flag: country.flag,
      currency: country.currency.toUpperCase(),
      rate: 1,
      callingCode: country.calling_code ?? null,
    };

    setState(optimistic);

    try {
      const ratesUrl = PUBLIC_API_URL
        ? `${PUBLIC_API_URL}/currency/rates`
        : "/api/currency/rates";

      let rates: Record<string, number> = {};

      if (PUBLIC_API_URL) {
        const res = await fetch(ratesUrl, { cache: "no-store" });
        const body = await res.json();
        rates = body?.rates ?? {};
      } else {
        const res = await axiosInstance.get("/api/currency/rates");
        rates = res.data?.rates ?? {};
      }

      const code = country.currency.toUpperCase();
      const rate =
        typeof rates[code] === "number" && Number.isFinite(rates[code])
          ? rates[code]
          : 1;

      const next: CurrencyState = {
        ...optimistic,
        rate,
      };

      setState(next);
      writeStoredState(next);
    } catch (error) {
      console.error("Failed to fetch rate:", error);
      setState(optimistic);
      writeStoredState(optimistic);
    }
  }, []);

  // ---------------------------------------------------
  // Helpers
  // ---------------------------------------------------

  const convert = useCallback(
    (usdAmount: number) => {
      if (!state) return usdAmount;
      return usdAmount * state.rate;
    },
    [state],
  );

  const format = useCallback(
    (usdAmount: number) => {
      if (!state?.currency) return String(usdAmount);

      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: state.currency,
          currencyDisplay: "code",
          maximumFractionDigits: 0,
        }).format(convert(usdAmount));
      } catch {
        return `${state.currency} ${convert(usdAmount).toLocaleString()}`;
      }
    },
    [state, convert],
  );

  const value: CurrencyContextValue = {
    country: state?.country ?? "",
    countryName: state?.countryName ?? null,
    flag: state?.flag ?? null,
    currency: state?.currency ?? "",
    rate: state?.rate ?? 1,
    callingCode: state?.callingCode ?? null,
    loading,
    convert,
    format,
    selectCountry,
    refresh: fetchFromServer,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// -----------------------------------------------------
// Hook
// -----------------------------------------------------

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);

  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return ctx;
}
