import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const CalorieProgress = ({ consumed, total }) => {
  const progress = total > 0 ? (consumed / total) * 100 : 0; // Prevent division by zero
  const remaining = total - consumed;
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: progress > 100 ? 'red' : '#007AFF' }]} />
      </View>
      <Text style={[styles.progressText, { color: theme.text }]}>
         {consumed} / {total} cal
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10, // Add some spacing
  },
  progressBarContainer: {
    height: 20, // Make it a bit taller
    backgroundColor: '#f0f0f0',
    borderRadius: 10, // More rounded
    overflow: 'hidden',
    marginBottom: 5
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
    // backgroundColor: '#007AFF',  // Moved to inline style
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'sans-serif',
    textAlign: 'center',
  },

});

export default CalorieProgress;