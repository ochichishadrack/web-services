'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, User, Home, Briefcase, FolderKanban, Menu, X } from 'lucide-react';

interface TopNavProps {
  activePage?: 'home' | 'services' | 'projects' | 'account' | 'notifications';
}

export default function TopNav({ activePage = 'home' }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'Home', href: '/', icon: Home },
    { key: 'services', label: 'Services', href: '/services', icon: Briefcase },
    { key: 'projects', label: 'My Projects', href: '/projects', icon: FolderKanban },
    { key: 'account', label: 'Account', href: '/account', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Web Services
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Notifications on desktop */}
          <Link
            href="/notifications"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </nav>

        {/* ================= MOBILE ACTIONS ================= */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Notifications */}
          <Link
            href="/notifications"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell className="w-5 h-5" />
          </Link>

          {/* Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-2 bg-white dark:bg-gray-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
