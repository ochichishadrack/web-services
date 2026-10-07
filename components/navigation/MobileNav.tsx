'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MoreVertical, LogIn, LogOut } from 'lucide-react';
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
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <div className="flex md:hidden items-center w-full relative" ref={menuRef}>
      {/* Brand */}
      <Link href="/" className="font-semibold text-lg tracking-tight text-gray-900 dark:text-white">
        MARA DEVS
      </Link>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-1">
        <CountrySelector />

        {/* Menu trigger */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          className="absolute top-full right-0 mt-2 z-[9999]
            w-56
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-xl
            overflow-hidden
            animate-in fade-in zoom-in-95 duration-150"
        >
          <nav className="py-1.5">
            {navItems.map((item) => {
              const isActive = activePage === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Profile link when logged in */}
            {!authLoading && isAuthenticated && (
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  activePage === 'account'
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Auth section */}
          {!authLoading && (
            <div className="border-t border-gray-100 dark:border-gray-800">
              {isAuthenticated && customer ? (
                <div className="px-4 py-3">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg px-2.5 py-2 -mx-1 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Log Out
                  </button>
                </div>
              ) : (
                <Link
                  href={loginHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
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
