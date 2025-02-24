import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const ExerciseItem = ({ exercise, onEdit, onDelete }) => {
  const { theme } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => onDelete(exercise),
          style: "destructive"
        }
      ]
    );
  };

  const renderRightActions = (progress, dragX) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => onEdit(exercise)}
        >
          <Ionicons name="pencil" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.exerciseName, { color: theme.text }]}>
          {exercise.name}
        </Text>
        {exercise.details && (
          <Text style={[styles.details, { color: theme.textSecondary }]}>
            {exercise.details}
          </Text>
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  details: {
    fontSize: 14,
    marginTop: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginRight: 16,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: '#4A90E2',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  }
});

export default ExerciseItem;
