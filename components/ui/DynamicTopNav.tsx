'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, MoreVertical, LogIn, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import CountrySelector from '@/components/ui/CountrySelector';

interface DynamicTopNavProps {
  title: string;
  showBack?: boolean; // optional, defaults to true
  showMenu?: boolean; // optional, defaults to true
}

const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'services', label: 'Services', href: '/services' },
  { key: 'portfolios', label: 'Our Portfolio', href: '/portfolios' },
  { key: 'projects', label: 'Projects', href: '/projects' },
];

export default function DynamicTopNav({
  title,
  showBack = true,
  showMenu = true,
}: DynamicTopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, loading: authLoading, customer, logout } = useCustomerAuth();

  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
  const itemIdle = 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10';

  return (
    <header
      className="
        sticky top-0 z-50
        bg-white/90 dark:bg-[#1f2228]/90 backdrop-blur
        border-b border-gray-100 dark:border-white/10
        pt-[env(safe-area-inset-top)]
      "
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 md:px-6">
        {/* Back button */}
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="
              -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full
              text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-white/10
              active:scale-95 transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40
            "
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <h1 className="min-w-0 flex-1 truncate pl-1 text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>

        <div className="shrink-0">
          <CountrySelector />
        </div>

        {/* 3-dot menu — far right */}
        {showMenu && (
          <div className="relative -mr-1 shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="
                flex h-9 w-9 items-center justify-center rounded-full
                text-gray-600 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-white/10
                active:scale-95 transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40
              "
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="
                  absolute right-0 top-full z-[9999] mt-2 w-56 overflow-hidden
                  rounded-xl border border-gray-100 dark:border-white/10
                  bg-white dark:bg-[#1f2228] shadow-lg
                  animate-in fade-in zoom-in-95 duration-150
                "
              >
                <nav className="py-1.5">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`${itemBase} ${active ? itemActive : itemIdle}`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  {!authLoading && isAuthenticated && (
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive('/account') ? 'page' : undefined}
                      className={`${itemBase} ${isActive('/account') ? itemActive : itemIdle}`}
                    >
                      Profile
                    </Link>
                  )}
                </nav>

                {!authLoading && (
                  <div className="border-t border-gray-100 dark:border-white/10">
                    {isAuthenticated && customer ? (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                      >
                        <LogOut className="h-4 w-4 shrink-0 text-gray-400" />
                        Log Out
                      </button>
                    ) : (
                      <Link
                        href={loginHref}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
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
        )}
      </div>
    </header>
  );
}
