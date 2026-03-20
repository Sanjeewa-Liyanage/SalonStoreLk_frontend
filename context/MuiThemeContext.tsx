'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '@/utils/theme';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const MuiThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
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

  return (
    <ThemeProvider theme={theme}>
      <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
        {children}
      </ThemeContext.Provider>
    </ThemeProvider>
  );
};

export const useMuiTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useMuiTheme must be used within MuiThemeProvider');
  }
  return context;
};
