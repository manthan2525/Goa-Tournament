import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Permanent Light Mode provider — removes any dark mode remnants and locks theme to light.
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    // Remove old saved theme preferences from localStorage
    localStorage.removeItem('theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
