'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, User, Home, Briefcase, FolderKanban, Menu, X, LogIn } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { usePathname } from 'next/navigation';

interface TopNavProps {
  activePage?: 'home' | 'services' | 'projects' | 'account' | 'notifications';
}

export default function TopNav({ activePage = 'home' }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();
  const pathname = usePathname();

  const navItems = [
    { key: 'home', label: 'Home', href: '/', icon: Home },
    { key: 'services', label: 'Services', href: '/services', icon: Briefcase },
    { key: 'projects', label: 'My Projects', href: '/projects', icon: FolderKanban },
    { key: 'account', label: 'Account', href: '/account', icon: User },
  ];

  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent"
        >
          Web Services
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}

                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Conditional sign in or notifications */}
          {!authLoading && !isAuthenticated ? (
            <Link
              href={loginHref}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          ) : (
            <Link
              href="/notifications"
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </Link>
          )}
        </nav>

        {/* ================= MOBILE ACTIONS ================= */}
        <div className="flex items-center gap-3 md:hidden">
          {/* No bordered Sign In button on mobile — only show notifications when authenticated */}
          {!authLoading && isAuthenticated && (
            <Link
              href="/notifications"
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500"
            >
              <Bell className="w-5 h-5" />
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-1.5 bg-white dark:bg-gray-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {!authLoading && !isAuthenticated && (
            <Link
              href={loginHref}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all font-medium"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
