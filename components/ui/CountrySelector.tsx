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
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-orange-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all"
      >
        {flag ? (
          <img src={flag} alt={country} className="w-6 h-4 rounded-xs object-cover" />
        ) : (
          <span className="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-700" />
        )}
        <span className="tracking-wide">{country}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or currency"
                className="w-full bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto">
            {!fetched && (
              <div className="p-4 text-sm text-gray-400 text-center">Loading countries…</div>
            )}

            {fetched && filtered.length === 0 && (
              <div className="p-4 text-sm text-gray-400 text-center">No matches</div>
            )}

            {filtered.map((c) => {
              const isSelected = c.code === country;
              return (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                    ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {c.flag ? (
                    <img
                      src={c.flag}
                      alt={c.code}
                      className="w-5 h-5 rounded-xm object-cover shrink-0"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-sm bg-gray-200 dark:bg-gray-700 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{c.name || c.code}</span>
                  <span className="text-xs text-gray-400">{c.currency}</span>
                  {isSelected && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
