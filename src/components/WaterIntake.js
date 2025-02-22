import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const WaterIntake = ({ intake, goal, onAddWater, onRemoveWater, unit = 'oz', onUnitChange }) => {
  // Calculate progress based on the current unit
  const progress = goal > 0 ? (intake / goal) * 100 : 0;

  // Format the intake number to avoid long decimals
  const formatNumber = (num) => Math.round(num);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.label}>Water Intake</Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.unitLabel, unit === 'oz' && styles.activeUnit]}>oz</Text>
          <Switch
            value={unit === 'ml'}
            onValueChange={(value) => onUnitChange(value ? 'ml' : 'oz')}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={unit === 'ml' ? "#007AFF" : "#f4f3f4"}
          />
          <Text style={[styles.unitLabel, unit === 'ml' && styles.activeUnit]}>ml</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(100, progress)}%`,
              backgroundColor: progress > 100 ? 'red' : '#007AFF',
            },
          ]}
        />
      </View>
      <Text style={styles.intakeText}>
        {formatNumber(intake)} / {formatNumber(goal)} {unit}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={onRemoveWater}>
          <Ionicons name="remove" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={onAddWater}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
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
    fontWeight: '600',
    color: '#333',
  },
  unitLabel: {
    fontSize: 16,
    marginHorizontal: 5,
    color: '#666',
  },
  activeUnit: {
    color: '#007AFF',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 20,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  intakeText: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WaterIntake;