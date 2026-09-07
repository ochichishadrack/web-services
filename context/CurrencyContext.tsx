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

// -----------------------------------------------------
// Read currency/country from localStorage
// -----------------------------------------------------

function readStoredState(): CurrencyState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    // Country code and currency are required
    if (
      !parsed ||
      typeof parsed.country !== "string" ||
      !parsed.country.trim() ||
      typeof parsed.currency !== "string" ||
      !parsed.currency.trim()
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

// -----------------------------------------------------
// Save currency/country to localStorage
// -----------------------------------------------------

function writeStoredState(state: CurrencyState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be disabled or full.
    // Application will continue using in-memory state.
  }
}

// -----------------------------------------------------
// Provider
// -----------------------------------------------------

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrencyState>(DEFAULT_STATE);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------
  // Fetch currency based on user's location
  // ---------------------------------------------------

  const fetchFromServer = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.get("/api/currency/for-me");

      const next: CurrencyState = {
        country: String(res.data?.country ?? "US").toUpperCase(),

        countryName: res.data?.country_name ?? null,

        flag: res.data?.flag ?? null,

        currency: String(res.data?.currency ?? "USD").toUpperCase(),

        rate:
          typeof res.data?.rate === "number" && Number.isFinite(res.data.rate)
            ? res.data.rate
            : 1,
      };

      // Update React state
      setState(next);

      // Save detected country/currency
      // so we don't need to detect it again
      writeStoredState(next);
    } catch (error) {
      console.error("Failed to detect country/currency:", error);

      // Keep existing/default state
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------
  // Initialize currency
  //
  // 1. Check localStorage
  // 2. If country exists -> use it
  // 3. If country doesn't exist -> backend detection
  // ---------------------------------------------------

  useEffect(() => {
    const initializeCurrency = async () => {
      const stored = readStoredState();

      // Country/currency already stored
      if (stored) {
        setState(stored);
        setLoading(false);
        return;
      }

      // Nothing stored.
      // Ask backend to detect the user's location.
      await fetchFromServer();
    };

    void initializeCurrency();
  }, [fetchFromServer]);

  // ---------------------------------------------------
  // Manually select a country
  // ---------------------------------------------------

  const selectCountry = useCallback(async (country: Country) => {
    // Immediately update UI
    const optimisticState: CurrencyState = {
      country: country.code.toUpperCase(),
      countryName: country.name,
      flag: country.flag,
      currency: country.currency.toUpperCase(),
      rate: 1,
    };

    setState(optimisticState);

    try {
      // Get latest USD -> currency rates
      const res = await axiosInstance.get("/api/currency/rates");

      const rate =
        typeof res.data?.rates?.[country.currency] === "number"
          ? res.data.rates[country.currency]
          : 1;

      const next: CurrencyState = {
        country: country.code.toUpperCase(),
        countryName: country.name,
        flag: country.flag,
        currency: country.currency.toUpperCase(),
        rate,
      };

      // Update state
      setState(next);

      // Save user's selection
      writeStoredState(next);
    } catch (error) {
      console.error("Failed to fetch currency rate:", error);

      // Country selection still works even
      // if the rate request fails.
      const next: CurrencyState = {
        ...optimisticState,
        rate: 1,
      };

      setState(next);
      writeStoredState(next);
    }
  }, []);

  // ---------------------------------------------------
  // Convert USD -> selected currency
  // ---------------------------------------------------

  const convert = useCallback(
    (usdAmount: number) => {
      return usdAmount * state.rate;
    },
    [state.rate],
  );

  // ---------------------------------------------------
  // Format currency
  // ---------------------------------------------------

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

  // ---------------------------------------------------
  // Provider
  // ---------------------------------------------------

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
