import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const WaterIntake = ({ intake, goal, onAddWater, onRemoveWater }) => {
  const progress = goal > 0 ? (intake / goal) * 100 : 0;

  return (
    <View style={styles.container}>

      <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, {width: `${progress}%`, backgroundColor: progress > 100 ? 'red' : '#007AFF'}]}></View>
      </View>
      <Text style={styles.intakeText}>{intake} / {goal} ml</Text>
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.addButton} onPress={onRemoveWater}>
            <Ionicons name="remove" size={22} color="white" style={{ marginTop: -2, marginRight: -2 }}/>
        </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={onAddWater}>
        <Ionicons name="add" size={22} color="white" style={{ marginTop: -2, marginRight: -2 }} />
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
  progressBarContainer: {
    height: 20,
    width: '100%', // Full width
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  intakeText: {
    fontSize: 18,
    fontFamily: 'sans-serif',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    width: 40, // Fixed width for the button
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,

  },
  buttonContainer: {
    flexDirection: 'row'
  },
});

export default WaterIntake;