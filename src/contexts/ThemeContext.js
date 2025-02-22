import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../styles/colors';

const lightTheme = lightColors;

const darkTheme = darkColors;

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const [theme, setTheme] = useState(systemColorScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode) {
          setThemeMode(savedThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  useEffect(() => {
    // Save theme preference whenever it changes
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('themeMode', themeMode);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };
    saveThemePreference();

    // Update theme based on mode and system preference
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
    } else {
      setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
    }
  }, [themeMode, systemColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};