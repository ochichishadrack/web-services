'use client';

import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

interface TopNavProps {
  activePage?: 'home' | 'services' | 'projects' | 'portfolio' | 'account' | 'notifications';
}

export default function TopNav({ activePage = 'home' }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto px-4 md:px-6 h-16 flex items-center">
        <DesktopNav activePage={activePage} />
        <MobileNav activePage={activePage} />
      </div>
    </header>
  );
}
