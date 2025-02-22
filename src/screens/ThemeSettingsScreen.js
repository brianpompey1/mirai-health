import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ThemeSettingsScreen = ({ navigation }) => {
  const { theme, setThemeMode, themeMode } = useTheme();

  const themeOptions = [
    { id: 'light', label: 'Light Mode', icon: 'sunny-outline' },
    { id: 'dark', label: 'Dark Mode', icon: 'moon-outline' },
    { id: 'system', label: 'System Default', icon: 'phone-portrait-outline' }
  ];

  const handleThemeSelect = (mode) => {
    setThemeMode(mode);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Theme Settings</Text>
      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionContainer,
            { backgroundColor: theme.cardBackground },
            themeMode === option.id && styles.selectedOption
          ]}
          onPress={() => handleThemeSelect(option.id)}
        >
          <View style={styles.optionContent}>
            <Ionicons
              name={option.icon}
              size={24}
              color={themeMode === option.id ? theme.primary : theme.text}
            />
            <Text
              style={[
                styles.optionText,
                { color: themeMode === option.id ? theme.primary : theme.text }
              ]}
            >
              {option.label}
            </Text>
          </View>
          {themeMode === option.id && (
            <Ionicons name="checkmark" size={24} color={theme.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});

export default ThemeSettingsScreen;
