'use client';

import { useState, useEffect, useRef, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { MoreVertical, LogIn, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { usePathname, useRouter } from 'next/navigation';
import CountrySelector from '@/components/ui/CountrySelector';

interface MobileNavProps {
  activePage: string;
}

const PAGE_TITLES: Record<string, string> = {
  home: 'MARASPOT',
  services: 'Services',
  portfolios: 'Our Portfolio',
  projects: 'Projects',
  account: 'Account',
  orders: 'Orders',
  checkout: 'Checkout',
};

const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'services', label: 'Services', href: '/services' },
  { key: 'portfolios', label: 'Our Portfolio', href: '/portfolios' },
  { key: 'projects', label: 'Projects', href: '/projects' },
] as const;

const ACCOUNT_HREF = '/account';

function resolveTitle(pathname: string, activePage: string): string {
  // Explicit activePage mapping first
  if (PAGE_TITLES[activePage]) return PAGE_TITLES[activePage];

  // Path-based fallbacks for nested routes
  if (pathname.startsWith('/projects')) return 'Projects';
  if (pathname.startsWith('/portfolios')) return 'Our Portfolio';
  if (pathname.startsWith('/services')) return 'Services';
  if (pathname.startsWith('/account')) return 'Account';
  if (pathname.startsWith('/checkout') || pathname.includes('checkout')) return 'Checkout';
  if (pathname.startsWith('/orders')) return 'Orders';

  return 'MARASPOT';
}

/** True for Ctrl/Cmd/Shift/Alt-click or non-left click, so the browser can handle it (new tab, etc.) */
function isModifiedEvent(e: React.MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

export default function MobileNav({ activePage }: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const { isAuthenticated, loading: authLoading, customer, logout } = useCustomerAuth();
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => resolveTitle(pathname, activePage), [pathname, activePage]);
  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  /* ---------- prefetch routes so taps feel instant ---------- */
  const prefetch = useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {
        /* prefetch is best-effort */
      }
    },
    [router]
  );

  // Menu items are not mounted while closed, so Link can't prefetch them. Do it here.
  useEffect(() => {
    NAV_ITEMS.forEach((item) => prefetch(item.href));
  }, [prefetch]);

  useEffect(() => {
    if (authLoading) return;
    prefetch(isAuthenticated ? ACCOUNT_HREF : '/login');
  }, [authLoading, isAuthenticated, prefetch]);

  /* ---------- navigation ---------- */
  const navigate = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Let the browser handle new-tab / new-window clicks
      if (isModifiedEvent(e)) return;

      e.preventDefault();
      setMenuOpen(false);

      // Already on this page → just close the menu
      const target = href.split('?')[0];
      if (target === pathname) return;

      setPendingHref(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router]
  );

  /* ---------- menu behaviour ---------- */
  // Clear optimistic state once the route actually changes
  useEffect(() => {
    setMenuOpen(false);
    setPendingHref(null);
  }, [pathname]);

  // Close on outside press (pointerdown covers mouse + touch)
  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
  };

  const itemBase =
    'block px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-white/5';
  const itemActive = 'bg-gray-50 dark:bg-white/5 font-medium text-gray-900 dark:text-white';
  const itemIdle = 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5';

  // Optimistic: the tapped item counts as active immediately
  const isItemActive = (key: string, href: string) =>
    pendingHref ? pendingHref === href : activePage === key;

  const accountActive = pendingHref ? pendingHref === ACCOUNT_HREF : activePage === 'account';

  return (
    <div className="relative flex w-full items-center md:hidden" ref={menuRef}>
      {/* Dynamic title based on current page */}
      <Link
        href="/"
        prefetch
        onClick={(e) => navigate(e, '/')}
        className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white truncate max-w-[60%]"
      >
        {title}
      </Link>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-1">
        <CountrySelector />

        {/* Menu trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="
            flex h-9 w-9 items-center justify-center rounded-full
            text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-white/10
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40
          "
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          className="
            absolute right-0 top-full z-[9999] mt-2 w-56 overflow-hidden
            rounded-xl border border-gray-100 dark:border-white/10
            bg-white dark:bg-[#1f2228] shadow-lg
            animate-in fade-in zoom-in-95 duration-150
          "
        >
          <nav className="py-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = isItemActive(item.key, item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  prefetch
                  onClick={(e) => navigate(e, item.href)}
                  onTouchStart={() => prefetch(item.href)}
                  onMouseEnter={() => prefetch(item.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${itemBase} ${isActive ? itemActive : itemIdle}`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Profile link when logged in */}
            {!authLoading && isAuthenticated && (
              <Link
                href={ACCOUNT_HREF}
                prefetch
                onClick={(e) => navigate(e, ACCOUNT_HREF)}
                onTouchStart={() => prefetch(ACCOUNT_HREF)}
                onMouseEnter={() => prefetch(ACCOUNT_HREF)}
                aria-current={accountActive ? 'page' : undefined}
                className={`${itemBase} ${accountActive ? itemActive : itemIdle}`}
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Auth section */}
          {!authLoading && (
            <div className="border-t border-gray-100 dark:border-white/10">
              {isAuthenticated && customer ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-gray-400" />
                  Log Out
                </button>
              ) : (
                <Link
                  href={loginHref}
                  prefetch
                  onClick={(e) => navigate(e, loginHref)}
                  onTouchStart={() => prefetch(loginHref)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 dark:text-white dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                >
                  <LogIn className="h-4 w-4 shrink-0 text-gray-400" />
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
