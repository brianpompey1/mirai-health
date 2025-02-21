import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MealCard = ({ meal }) => {
  const totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.mealTitle}>{meal.name}</Text>
      {meal.items.map((item, index) => (
        <View key={index} style={styles.foodItem}>
          <View style={styles.foodNameContainer}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.macros}>
              P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
            </Text>
          </View>
          <Text style={styles.calories}>{item.calories} cal</Text>
        </View>
      ))}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Calories: {totalCalories}</Text>
      </View>
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
  macros: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  calories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  totalContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
});

export default MealCard;