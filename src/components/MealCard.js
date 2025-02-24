import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const MealCard = ({ meal, onEdit, onDelete }) => {
  const { theme } = useTheme();

  if (!meal) return null;

  // Ensure foodItems is always an array
  const foodItems = meal.foodItems || [];

  // Format time string
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // Extract hours and minutes from the time string (assuming format like "13:00:00")
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => onDelete(meal.id),
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
          onPress={() => onEdit(meal)}
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
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.mealTitle, { color: theme.text }]}>
          {meal.type || 'Meal'} {meal.time ? `- ${formatTime(meal.time)}` : ''}
        </Text>
        {foodItems.map((item) => (
          <View key={item.id} style={[styles.foodItem, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.foodNameContainer, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.servings, { color: theme.secondary }]}>
                {item.servings} {item.servings === 1 ? 'serving' : 'servings'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  foodNameContainer: {
    flex: 1,
    marginRight: 10,
  },
  foodName: {
    fontSize: 16,
  },
  servings: {
    fontSize: 12,
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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

export default MealCard;