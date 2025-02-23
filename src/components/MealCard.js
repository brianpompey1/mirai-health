import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MealCard = ({ meal }) => {
  const { theme } = useTheme();

  if (!meal || !meal.foodItems) return null;

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

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.mealTitle, { color: theme.text }]}>
        {meal.type || 'Meal'} {meal.time ? `- ${formatTime(meal.time)}` : ''}
      </Text>
      {meal.foodItems.map((item) => (
        <View key={item.id} style={[styles.foodItem, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.foodNameContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.servings, { color: theme.textSecondary }]}>
              {item.servings} {item.servings === 1 ? 'serving' : 'servings'}
            </Text>
          </View>
        </View>
      ))}
    </View>
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
  }
});

export default MealCard;