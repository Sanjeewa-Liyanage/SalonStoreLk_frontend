'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Theme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { createAppTheme } from '@/utils/theme';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const createMuiEmotionCache = () => {
  const cache = createCache({ key: 'mui', prepend: true });
  cache.compat = true;
  return cache;
};

export const MuiThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [{ cache, flush }] = useState(() => {
    const cache = createMuiEmotionCache();
    const prevInsert = cache.insert;
    let inserted: string[] = [];

    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme-preference');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem('theme-preference', newValue ? 'dark' : 'light');
      return newValue;
    });
  };

  const theme = createAppTheme(isDark);

  // ✅ Always render context provider so useMuiTheme() never throws
  if (!mounted) {
  const defaultTheme = createAppTheme(false);
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={defaultTheme}>
        <ThemeContext.Provider value={{ isDark: false, toggleTheme, theme: defaultTheme }}>
          {children}  {/* ← Remove the Box wrapper with visibility:hidden */}
        </ThemeContext.Provider>
      </ThemeProvider>
    </CacheProvider>
  );
}

  return (
		<CacheProvider value={cache}>
			<ThemeProvider theme={theme}>
				<ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
					{children}
				</ThemeContext.Provider>
			</ThemeProvider>
		</CacheProvider>
  );
};

export const useMuiTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useMuiTheme must be used within MuiThemeProvider');
  }
  return context;
};