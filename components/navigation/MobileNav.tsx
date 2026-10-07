'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { usePathname } from 'next/navigation';
import CountrySelector from '@/components/ui/CountrySelector';

interface MobileNavProps {
  activePage: string;
}

export default function MobileNav({ activePage }: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, loading: authLoading, customer, logout } = useCustomerAuth();
  const pathname = usePathname();

  const navItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'services', label: 'Services', href: '/services' },
    { key: 'projects', label: 'Projects', href: '/projects' },
  ];

  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <>
      {/* ========== MOBILE TOP BAR ========== */}
      <div className="flex md:hidden items-center w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link
            href="/"
            className="font-semibold text-lg tracking-tight text-gray-900 dark:text-white"
          >
            MARA DEVS
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <CountrySelector />
          {!authLoading && isAuthenticated && (
            <Link
              href="/notifications"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500"
            >
              Notifications
            </Link>
          )}
        </div>
      </div>

      {/* ========== BACKDROP ========== */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ========== TOP DROPDOWN PANEL ========== */}
      <div
        className={`fixed top-0 left-0 right-0 z-[9999] md:hidden
          bg-white dark:bg-gray-900
          border-b border-gray-200 dark:border-gray-800
          shadow-xl
          transform transition-transform duration-300 ease-out
          ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {/* Close bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Account link when logged in */}
          {!authLoading && isAuthenticated && (
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activePage === 'account'
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Profile
            </Link>
          )}
        </nav>

        {/* ========== BOTTOM SECTION ========== */}
        {!authLoading && (
          <div className="border-t border-gray-200 dark:border-gray-800">
            {isAuthenticated && customer ? (
              <div className="p-4 space-y-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {customer.email}
                  </p>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="p-4">
                <Link
                  href={loginHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
