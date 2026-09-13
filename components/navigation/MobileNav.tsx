'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, User, Home, Briefcase, FolderKanban, Menu, X, LogIn, LogOut } from 'lucide-react';
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
    { key: 'home', label: 'Home', href: '/', icon: Home },
    { key: 'services', label: 'Services', href: '/services', icon: Briefcase },
    { key: 'projects', label: 'Projects', href: '/projects', icon: FolderKanban },
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
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
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
              className="p-2  text-gray-600 dark:text-gray-300  hover:text-orange-500 "
            >
              <Bell className="w-5 h-5" />
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

      {/* ========== SIDEBAR ========== */}
      <aside
        className={`fixed top-0 left-0 z-[9999] h-screen w-[300px] max-w-[85vw]
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          shadow-2xl
          transform transition-transform duration-300 ease-out
          md:hidden flex flex-col
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header with background image */}
        <div className="relative h-44 shrink-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1669557841742-e3451e5d9349?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDl8fHxlbnwwfHx8fHw%3D')",
            }}
          />
          <div className="absolute inset-0 bg-black/50" />

          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="flex items-center justify-center mb-3 overflow-hidden">
              <Image
                src="/logo.png"
                alt="MARA DEVS"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <h2 className="text-white font-semibold text-lg tracking-tight">MARA DEVS</h2>
            <p className="text-white/70 text-xs mt-1">Build. Launch. Scale.</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}

            {/* Account link when logged in */}
            {!authLoading && isAuthenticated && (
              <>
                <div className="  border-gray-200 dark:border-gray-800" />
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activePage === 'account'
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <User className="w-5 h-5 shrink-0" />
                  Profile
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* ========== BOTTOM SECTION ========== */}
        {!authLoading && (
          <div className="border-t border-gray-200 dark:border-gray-800 shrink-0">
            {isAuthenticated && customer ? (
              // Logged in → Avatar + Name + Email + Logout
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-medium text-sm shrink-0">
                    {customer.first_name?.[0]}
                    {customer.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              // Logged out → Sign In button
              <div className="p-4">
                <Link
                  href={loginHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
