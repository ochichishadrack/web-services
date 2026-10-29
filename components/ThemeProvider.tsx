'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { ReactNode, useEffect } from 'react';

const THEME_COLORS = {
  light: '#ffffff',
  dark: '#1f2228', // matches your DynamicTopNav dark background
};

function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const color = resolvedTheme === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;

    // Remove old tags and add a fresh one so Chrome picks up the change
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
  }, [resolvedTheme]);

  return null;
}

interface Props {
  children: ReactNode;
}

export default function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
