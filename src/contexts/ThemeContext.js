import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../styles/colors';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark'); // Start with OS setting

  // Function to toggle dark mode (for the in-app switch)
    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    const theme = useMemo(() => {
      return isDarkMode ? darkColors : lightColors;
    }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to easily access the theme
export const useTheme = () => useContext(ThemeContext);