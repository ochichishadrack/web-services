'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, MoreVertical } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { usePathname } from 'next/navigation';
import CountrySelector from '@/components/ui/CountrySelector';

interface DesktopNavProps {
  activePage: string;
}

export default function DesktopNav({ activePage }: DesktopNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, loading: authLoading, logout } = useCustomerAuth();
  const pathname = usePathname();

  const navItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'services', label: 'Services', href: '/services' },
    { key: 'projects', label: 'Projects', href: '/projects' },
  ];

  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
  const signupHref = `/signup?callbackUrl=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <div className="hidden md:flex items-center w-full">
      {/* Logo */}
      <Link
        href="/"
        className="font-semibold text-xl tracking-tight text-gray-900 dark:text-white shrink-0"
      >
        MARA DEVS
      </Link>

      {/* Center tabs - no icons, no underline */}
      <nav className="flex-1 flex items-center justify-center gap-1">
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <CountrySelector />

        {!authLoading && !isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link
              href={loginHref}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={signupHref}
              className="px-3.5 py-1.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open profile menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-4 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1.5 z-50">
                <Link
                  href="/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
