'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Download } from 'lucide-react';

export default function InstallAppButton() {
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

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User installed the app');
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const closePrompt = () => {
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-95 z-50 animate-fade-in">
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-4">
        {/* App Icon */}
        <div className="shrink-0">
          <Image
            src="/favicon-192x192.png"
            alt="Maraspot"
            width={48}
            height={48}
            className="rounded-lg"
          />
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Install Maraspot</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add Maraspot to your device for a better & faster experience.
          </p>

          <button
            onClick={installApp}
            className="mt-2 inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
          >
            <Download size={14} />
            Install App
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={closePrompt}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
