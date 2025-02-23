import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// Define theme objects outside the provider
const lightTheme = {
    background: '#f0f0f0',
    cardBackground: '#ffffff',
    text: '#333333',
    border: '#E5E5EA',
    primary: '#007AFF',
    secondary: '#27ae60',
    success: '#27ae60',
    error: '#FF3B30',
    // Add contrasting colors for touchable elements
    actionButton: '#007AFF',          // Blue background for main actions
    actionButtonText: '#FFFFFF',      // White text for better contrast
    secondaryButton: '#E8E8ED',       // Light gray for secondary actions
    secondaryButtonText: '#007AFF',   // Blue text on light background
    importantButton: '#27ae60',       // Green for important actions like "Complete Day"
    importantButtonText: '#FFFFFF',   // White text for contrast
};

const darkTheme = {
    background: '#1E1B2E',
    cardBackground: '#252238',
    text: '#E8E8FF',
    border: '#363151',
    primary: '#9F8FFF',
    secondary: '#7A7CFF',
    success: '#7A7CFF',
    error: '#FF6B8B',
    // Add contrasting colors for touchable elements
    actionButton: '#9F8FFF',          // Bright purple for main actions
    actionButtonText: '#1E1B2E',      // Dark background color for contrast
    secondaryButton: '#363151',       // Darker purple for secondary actions
    secondaryButtonText: '#E8E8FF',   // Light text for contrast
    importantButton: '#7A7CFF',       // Periwinkle for important actions
    importantButtonText: '#1E1B2E',   // Dark background color for contrast
};

export const ThemeProvider = ({ children }) => {
    // Get the current system color scheme
    const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme());
    const [themePreference, setThemePreference] = useState('system'); 
    const [theme, setTheme] = useState(systemTheme === 'dark' ? darkTheme : lightTheme);

    // Listen for system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemTheme(colorScheme);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Load saved theme preference
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedPreference = await AsyncStorage.getItem('themePreference');
                if (savedPreference) {
                    setThemePreference(savedPreference);
                }
            } catch (error) {
                console.error('Error loading theme preference:', error);
            }
        };
        loadThemePreference();
    }, []);

    // Update theme based on preference and system theme
    useEffect(() => {
        const updateTheme = () => {
            if (themePreference === 'system') {
                setTheme(systemTheme === 'dark' ? darkTheme : lightTheme);
            } else {
                setTheme(themePreference === 'dark' ? darkTheme : lightTheme);
            }
        };
        updateTheme();
    }, [themePreference, systemTheme]);

    const setPreference = async (preference) => {
        try {
            await AsyncStorage.setItem('themePreference', preference);
            setThemePreference(preference);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ 
            theme,
            themePreference,
            setThemePreference: setPreference,
            isDark: themePreference === 'system' ? systemTheme === 'dark' : themePreference === 'dark'
        }}>
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