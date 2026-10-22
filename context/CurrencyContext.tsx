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
}

interface CurrencyState {
  country: string;
  countryName: string | null;
  flag: string | null;
  currency: string;
  rate: number;
}

interface CurrencyContextValue extends CurrencyState {
  loading: boolean;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
  selectCountry: (country: Country) => Promise<void>;
  refresh: () => Promise<void>;
}

const STORAGE_KEY = "app_currency_v1";

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

// -----------------------------------------------------
// localStorage helpers (only used AFTER user selects a country)
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

// -----------------------------------------------------
// Provider
// -----------------------------------------------------

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrencyState | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------
  // Always fetch from backend (IP-based detection)
  // ---------------------------------------------------

  const fetchFromServer = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.get("/api/currency/for-me");

      const next: CurrencyState = {
        country: String(res.data.country).toUpperCase(),
        countryName: res.data.country_name ?? null,
        flag: res.data.flag ?? null,
        currency: String(res.data.currency).toUpperCase(),
        rate:
          typeof res.data.rate === "number" && Number.isFinite(res.data.rate)
            ? res.data.rate
            : 1,
      };

      setState(next);
      // Do NOT write to localStorage here — only when user manually selects
    } catch (error) {
      console.error("Failed to fetch currency from backend:", error);
      // No fallback — state stays null
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------
  // On mount: always ask the backend
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
    };

    setState(optimistic);

    try {
      const res = await axiosInstance.get("/api/currency/rates");

      const rate =
        typeof res.data?.rates?.[country.currency] === "number"
          ? res.data.rates[country.currency]
          : 1;

      const next: CurrencyState = {
        ...optimistic,
        rate,
      };

      setState(next);
      writeStoredState(next); // only persist after user choice
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
      if (!state) return String(usdAmount);

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

  // While loading or if the request failed, expose safe defaults
  const value: CurrencyContextValue = {
    country: state?.country ?? "",
    countryName: state?.countryName ?? null,
    flag: state?.flag ?? null,
    currency: state?.currency ?? "",
    rate: state?.rate ?? 1,
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
