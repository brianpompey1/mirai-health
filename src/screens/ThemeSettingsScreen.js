import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ThemeSettingsScreen = () => {
    const { theme, themePreference, setThemePreference } = useTheme();

    const themeOptions = [
        { id: 'light', label: 'Light Mode', icon: 'sunny' },
        { id: 'dark', label: 'Dark Mode', icon: 'moon' },
        { id: 'system', label: 'System Default', icon: 'phone-portrait' }
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Theme Settings</Text>
            <View style={styles.optionsContainer}>
                {themeOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.option,
                            { backgroundColor: theme.cardBackground },
                            themePreference === option.id && styles.selectedOption
                        ]}
                        onPress={() => setThemePreference(option.id)}
                    >
                        <View style={styles.optionContent}>
                            <Ionicons
                                name={option.icon}
                                size={24}
                                color={themePreference === option.id ? theme.primary : theme.text}
                            />
                            <Text style={[
                                styles.optionText,
                                { color: themePreference === option.id ? theme.primary : theme.text }
                            ]}>
                                {option.label}
                            </Text>
                        </View>
                        {themePreference === option.id && (
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={theme.primary}
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24
    },
    optionsContainer: {
        gap: 16
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: '#2196F3'
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500'
    }
});

export default ThemeSettingsScreen;
