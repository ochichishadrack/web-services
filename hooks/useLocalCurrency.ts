// hooks/useLocalCurrency.ts
"use client";

import { useCallback, useState } from "react";
import { useCurrency, type Country } from "@/context/CurrencyContext";
import { axiosInstance } from "@/utils/axiosInstance";

/**
 * Thin wrapper around CurrencyContext for components that just need
 * currency/rate/convert/format, plus an optional explicit-country lookup
 * (e.g. a country picker) that goes straight to /by-country/:code.
 *
 * Resolution order for the base state (handled inside CurrencyProvider):
 * localStorage cache -> IP-based detection (/for-me) -> USD fallback.
 */
export function useLocalCurrency() {
  const { currency, rate, convert, format, loading, selectCountry } =
    useCurrency();

  const [byCountryLoading, setByCountryLoading] = useState(false);

  // For flows that have just a country code (not a full Country object)
  // and want to look up + apply its currency/rate directly.
  const selectByCountryCode = useCallback(
    async (code: string) => {
      setByCountryLoading(true);
      try {
        const res = await axiosInstance.get(`/api/currency/by-country/${code}`);
        const country: Country = {
          code: res.data.country ?? code.toUpperCase(),
          name: res.data.country_name ?? null,
          flag: res.data.flag ?? null,
          currency: res.data.currency ?? "USD",
        };
        await selectCountry(country);
      } catch {
        // network/lookup failed - leave existing context state untouched
        // (already resolved to USD/1 by the provider if nothing was cached)
      } finally {
        setByCountryLoading(false);
      }
    },
    [selectCountry],
  );

  return {
    currency,
    rate,
    convert,
    format,
    loading: loading || byCountryLoading,
    selectByCountryCode,
  };
}
