'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Linkedin, Github, Download } from 'lucide-react';
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
    <footer className="relative bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-gray-300 mt-12 border-t border-zinc-800/80">
      {/* Subtle top highlight line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm md:text-base">
        {/* About */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white tracking-tight">Web Services</h4>
          <p className="text-gray-400 leading-relaxed">
            We deliver modern, responsive, and scalable web solutions tailored for your business.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h5 className="font-semibold text-white">Quick Links</h5>
          <ul className="space-y-2">
            <li>
              <Link
                href="/services"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                My Projects
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Account
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h5 className="font-semibold text-white">Contact</h5>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2.5 text-gray-400">
              <Mail className="w-4 h-4 text-orange-500/80" />
              maraspot.ke@gmail.com
            </li>
            <li className="flex items-center gap-2.5 text-gray-400">
              <Phone className="w-4 h-4 text-orange-500/80" />
              +254 113 388 120
            </li>
            <li className="flex items-center gap-2.5 text-gray-400">
              <MapPin className="w-4 h-4 text-orange-500/80" />
              Nairobi, Kenya
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="space-y-3">
          <h5 className="font-semibold text-white">Follow Us</h5>
          <div className="flex gap-4">
            <Link
              href="#"
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all"
            >
              <Github className="w-4 h-4" />
            </Link>
          </div>
          {showInstall && (
            <button
              onClick={handleInstallClick}
              className="flex mt-5 items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Maraspot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
