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

const DEFAULT_STATE: CurrencyState = {
  country: "US",
  countryName: null,
  flag: null,
  currency: "USD",
  rate: 1,
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

function readStoredState(): CurrencyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.currency || !parsed?.country) return null;
    return parsed as CurrencyState;
  } catch {
    return null;
  }
}

function writeStoredState(state: CurrencyState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full/disabled - state still works in-memory for this session
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrencyState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const fetchFromServer = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/currency/for-me");
      const next: CurrencyState = {
        country: res.data.country ?? "US",
        countryName: res.data.country_name ?? null,
        flag: res.data.flag ?? null,
        currency: res.data.currency ?? "USD",
        rate: res.data.rate ?? 1,
      };
      setState(next);
      writeStoredState(next);
    } catch {
      // silently keep whatever was already loaded (stored or default)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = readStoredState();
    if (stored) {
      setState(stored);
      setLoading(false);
      return;
    }
    void fetchFromServer();
  }, [fetchFromServer]);

  const selectCountry = useCallback(async (country: Country) => {
    // Optimistic update so the UI reflects the pick immediately.
    setState((prev) => ({
      ...prev,
      country: country.code,
      countryName: country.name,
      flag: country.flag,
      currency: country.currency,
    }));

    try {
      const res = await axiosInstance.get("/api/currency/rates");
      const rate = res.data?.rates?.[country.currency] ?? 1;

      const next: CurrencyState = {
        country: country.code,
        countryName: country.name,
        flag: country.flag,
        currency: country.currency,
        rate,
      };
      setState(next);
      writeStoredState(next);
    } catch {
      // rate fetch failed - keep the country/flag/currency change,
      // just fall back to rate 1 so nothing breaks visually
      setState((prev) => {
        const next = { ...prev, rate: 1 };
        writeStoredState(next);
        return next;
      });
    }
  }, []);

  const convert = useCallback(
    (usdAmount: number) => usdAmount * state.rate,
    [state.rate],
  );

  const format = useCallback(
    (usdAmount: number) => {
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
    [state.currency, convert],
  );

  return (
    <CurrencyContext.Provider
      value={{
        ...state,
        loading,
        convert,
        format,
        selectCountry,
        refresh: fetchFromServer,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
