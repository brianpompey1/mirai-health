import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MealCard = ({ meal }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.mealTitle, { color: theme.text }]}>{meal.name}</Text>
      {meal.items.map((item, index) => (
        <View key={index} style={[styles.foodItem, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.foodNameContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.servings, { color: theme.text }]}>
              {item.servings} servings
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
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
    color: '#333',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodNameContainer: {
    flex: 1,
    marginRight: 10,
  },
  foodName: {
    fontSize: 16,
    color: '#444',
  },
  servings: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  }
});

export default MealCard;