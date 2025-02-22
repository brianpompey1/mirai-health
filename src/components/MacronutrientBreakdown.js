import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MacronutrientBreakdown = ({ protein, carbs, fat }) => {
  const { theme } = useTheme();

    const total = protein + carbs + fat;
    const proteinPercent = total > 0 ? (protein / total) * 100 : 0;
    const carbsPercent = total > 0 ? (carbs / total) * 100 : 0;
    const fatPercent = total > 0 ? (fat / total) * 100 : 0;


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.macroRow, { backgroundColor: theme.background }]}>
        <View style={[styles.macroBar, { width: `${proteinPercent}%`, backgroundColor: 'orange' }]} />
        <Text style={[styles.macroLabel, { color: theme.text }]}>Protein: {protein}g</Text>
      </View>
      <View style={[styles.macroRow, { backgroundColor: theme.background }]}>
        <View style={[styles.macroBar, { width: `${carbsPercent}%`, backgroundColor: 'green' }]} />
        <Text style={[styles.macroLabel, { color: theme.text }]}>Carbs: {carbs}g</Text>
      </View>
      <View style={[styles.macroRow, { backgroundColor: theme.background }]}>
        <View style={[styles.macroBar, { width: `${fatPercent}%`, backgroundColor: 'blue' }]} />
        <Text style={[styles.macroLabel, { color: theme.text }]}>Fat: {fat}g</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  macroBar: {
    height: 10,
    borderRadius: 5,
    marginRight: 5
    // backgroundColor: 'blue', // Moved to inline styles
  },
  macroLabel: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    flex: 1, // Allow text to take remaining space
  },
});

export default MacronutrientBreakdown;