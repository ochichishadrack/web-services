// components/ui/CountrySelector.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { axiosInstance } from '@/utils/axiosInstance';
import { useCurrency, type Country } from '@/context/CurrencyContext';

export default function CountrySelector() {
  const { country, flag, currency, selectCountry } = useCurrency();
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [fetched, setFetched] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch the country list lazily, only when the dropdown is first opened.
  useEffect(() => {
    if (!open || fetched) return;
    (async () => {
      try {
        const res = await axiosInstance.get<Country[]>('/api/currency/countries');
        setCountries(res.data || []);
      } catch {
        setCountries([]);
      } finally {
        setFetched(true);
      }
    })();
  }, [open, fetched]);

  // Close on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return countries;
    const q = query.trim().toLowerCase();
    return countries.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency?.toLowerCase().includes(q)
    );
  }, [countries, query]);

  function handleSelect(c: Country) {
    void selectCountry(c);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger: flag + code + chevron */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="
          flex h-9 items-center gap-1.5 rounded-full px-2.5
          text-sm font-medium text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-white/10
          transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40
        "
      >
        {flag ? (
          <img src={flag} alt={country} className="h-3.5 w-5 rounded-[2px] object-cover" />
        ) : (
          <span className="h-3.5 w-5 rounded-[2px] bg-gray-200 dark:bg-white/10" />
        )}

        <span className="tracking-wide">{country}</span>

        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="
            absolute right-0 z-50 mt-2 flex max-h-80 w-72 flex-col overflow-hidden
            rounded-xl border border-gray-100 dark:border-white/10
            bg-white dark:bg-[#1f2228] shadow-lg
          "
        >
          {/* Search */}
          <div className="shrink-0 border-b border-gray-100 p-2 dark:border-white/10">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 dark:bg-white/5">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or currency"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
              />
            </div>
          </div>

          {/* List */}
          <div role="listbox" className="overflow-y-auto">
            {!fetched && (
              <div className="p-4 text-center text-sm text-gray-400">Loading countries…</div>
            )}

            {fetched && filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">No matches</div>
            )}

            {filtered.map((c) => {
              const isSelected = c.code === country;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  key={c.code}
                  onClick={() => handleSelect(c)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors
                    ${
                      isSelected
                        ? 'bg-gray-50 font-medium text-gray-900 dark:bg-white/5 dark:text-white'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5'
                    }`}
                >
                  <div className="h-5 w-6 shrink-0 overflow-hidden rounded-[4px] border border-gray-100 dark:border-white/10">
                    {c.flag ? (
                      <img src={c.flag} alt={c.code} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-white/10" />
                    )}
                  </div>

                  <span className="flex-1 truncate">{c.name || c.code}</span>
                  <span className="text-xs text-gray-400">{c.currency}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-gray-900 dark:text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
