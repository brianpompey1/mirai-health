import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

const AddExerciseScreen = ({ navigation, route }) => {
  const [exerciseSummary, setExerciseSummary] = useState(''); // Single text field for the summary
  const [loading, setLoading] = useState(false);

  const { closeModal } = route.params || {};

  useEffect(() => {
    if (closeModal) {
      closeModal();
    }
  }, [closeModal]);

  const handleAddExercise = async () => {
    if (!exerciseSummary) {
      Alert.alert('Error', 'Please enter a description of your exercise.');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert('Error', 'You must be logged in to add exercise.');
        navigation.navigate('Auth');
        return;
      }

      // Use upsert to update the daily_summaries table
      const { error } = await supabase
        .from('daily_summaries')
        .upsert(
          {
            user_id: user.id,
            date: new Date().toISOString().split('T')[0], // Today's date
            exercise_summary: exerciseSummary, // Store the summary
            // Other fields will remain as they are if already present
          },
          { onConflict: 'user_id, date' }
        )
        .select();

      if (error) {
        console.error('Error adding exercise:', error);
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Exercise summary added successfully!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Exercise</Text>

      <Text style={styles.label}>Exercise Summary:</Text>
      <TextInput
        style={styles.input}
        value={exerciseSummary}
        onChangeText={setExerciseSummary}
        placeholder="Describe your exercise for today..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddExercise}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>
          {loading ? 'Adding...' : 'Add Exercise'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'sans-serif-medium',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'sans-serif',
    height: 100, // For multiline input
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
  },
});

export default AddExerciseScreen;