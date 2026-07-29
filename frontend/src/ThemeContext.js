import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const lightTheme = {
  background: '#F5F6FA',
  card: '#ffffff',
  text: '#1A1A2E',
  subtext: '#888',
  border: '#eee',
  primary: '#6C63FF',
  tabBar: '#ffffff',
};

export const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  subtext: '#aaa',
  border: '#333',
  primary: '#6C63FF',
  tabBar: '#1E1E1E',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);