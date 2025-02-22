import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { useTheme } from '../contexts/ThemeContext';

const WaterIntake = ({ intake, goal, onAddWater, onRemoveWater, unit = 'oz', onUnitChange }) => {
  // Calculate progress based on the current unit
  const progress = goal > 0 ? (intake / goal) * 100 : 0;

  // Format the intake number to avoid long decimals
  const formatNumber = (num) => Math.round(num);

  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.label, { color: theme.text }]}>Water Intake</Text>
        <View style={[styles.switchContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.unitLabel, unit === 'oz' && styles.activeUnit, { color: theme.text }]}>oz</Text>
          <Switch
            value={unit === 'ml'}
            onValueChange={(value) => onUnitChange(value ? 'ml' : 'oz')}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={unit === 'ml' ? "#007AFF" : "#f4f3f4"}
          />
          <Text style={[styles.unitLabel, unit === 'ml' && styles.activeUnit, { color: theme.text }]}>ml</Text>
        </View>
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: theme.background }]}>
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(100, progress)}%`,
                backgroundColor: progress > 100 ? '#FF6B6B' : '#4ECDC4',
              },
            ]}
          >
            <View style={styles.progressBarGlow} />
          </View>
        </View>
        <View style={styles.progressMarkers}>
          <View style={styles.marker} />
          <View style={styles.marker} />
          <View style={styles.marker} />
          <View style={styles.marker} />
        </View>
      </View>
      <Text style={[styles.intakeText, { color: theme.text }]}>
        {formatNumber(intake)} / {formatNumber(goal)} {unit}
      </Text>
      <View style={[styles.buttonContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.buttonBackground }]} 
          onPress={onRemoveWater}
        >
          <Ionicons name="remove" size={24} color={theme.buttonText} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.buttonBackground }]} 
          onPress={onAddWater}
        >
          <Ionicons name="add" size={24} color={theme.buttonText} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
  },
  unitLabel: {
    fontSize: 16,
    marginHorizontal: 5,
    fontFamily: 'sans-serif',
  },
  activeUnit: {
    fontFamily: 'sans-serif-medium',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 5,
  },
  progressBarWrapper: {
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
    position: 'relative',
  },
  progressBarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  marker: {
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  intakeText: {
    fontSize: 16,
    marginVertical: 10,
    fontFamily: 'sans-serif-medium',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WaterIntake;