'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstall(false);
    }

    setDeferredPrompt(null);
  };

  return (
    <footer className="relative mt-12 border-t border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm md:text-base">
        {/* About */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            Mara Devs
          </h4>
          <p className="leading-relaxed text-zinc-600 dark:text-gray-400">
            We deliver modern, responsive, and scalable web solutions tailored for your business.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h5 className="font-semibold text-zinc-900 dark:text-white">Quick Links</h5>
          <ul className="space-y-2">
            <li>
              <Link
                href="/services"
                className="text-zinc-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                className="text-zinc-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
              >
                My Projects
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className="text-zinc-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
              >
                Account
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-zinc-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h5 className="font-semibold text-zinc-900 dark:text-white">Contact</h5>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2.5 text-zinc-600 dark:text-gray-400">
              <Mail className="w-4 h-4 text-orange-500" />
              maraspot.ke@gmail.com
            </li>
            <li className="flex items-center gap-2.5 text-zinc-600 dark:text-gray-400">
              <Phone className="w-4 h-4 text-orange-500" />
              +254 113 388 120
            </li>
            <li className="flex items-center gap-2.5 text-zinc-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-orange-500" />
              Nairobi, Kenya
            </li>
          </ul>
        </div>

        {/* Install App */}
        <div className="space-y-3">
          {showInstall && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} Maraspot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
