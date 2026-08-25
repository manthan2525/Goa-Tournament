import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Dark-mode only — no toggle, no localStorage theme key needed.
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    // Remove any stale light-mode theme key left over from a previous session.
    // We deliberately do NOT touch 'token' or any other auth keys.
    localStorage.removeItem('theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', isDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
