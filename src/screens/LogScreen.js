import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Import the date picker

const LogScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date()); // Start with today's date
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Placeholder data (replace with API data)
  const [logData, setLogData] = useState({
    date: new Date(), // Use Date objects for dates
    calories: {
      budget: 2004,
      food: 0,
      exercise: 0, // You might get this from an API
      net: 0,
      remaining: 2004,
    },
    meals: {
      breakfast: { name: 'Breakfast', suggestedCalories: 401, items: [] },
      lunch: { name: 'Lunch', suggestedCalories: 501, items: [] },
      dinner: { name: 'Dinner', suggestedCalories: 701, items: [] },
      snacks: { name: 'Snacks', suggestedCalories: 401, items: [] },
    },
    waterIntake: 0,
  });

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setSelectedDate(date);
        hideDatePicker();
        //TODO: Fetch log data for the new date.
        // setLogData(fetchLogData(date));

    };

    const formatDate = (date) => {
      return date.toDateString(); // e.g., "Mon Feb 17 2024"
    }
    const caloriesRemaining = logData.calories.budget - logData.calories.food + logData.calories.exercise


  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity>
                <Ionicons name='chevron-back-outline' size={24} color='black'/>
            </TouchableOpacity>
            <TouchableOpacity onPress={showDatePicker}>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name='chevron-forward-outline' size={24} color='black'/>
            </TouchableOpacity>
    </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Calorie Summary */}
        <View style={styles.calorieSummary}>
          <Text style={styles.calorieLabel}>CALORIES</Text>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieValue}>{logData.calories.budget}</Text>
            <Text style={styles.calorieLabelSmall}>BUDGET</Text>
            <Text style={styles.calorieValue}>{logData.calories.food}</Text>
            <Text style={styles.calorieLabelSmall}>FOOD</Text>
            <Text style={styles.calorieValue}>{logData.calories.exercise}</Text>
            <Text style={styles.calorieLabelSmall}>EXERCISE</Text>
            <Text style={styles.calorieValue}>{logData.calories.net}</Text>
            <Text style={styles.calorieLabelSmall}>NET</Text>
            <Text style={[styles.calorieValue, {color: caloriesRemaining > 0 ? 'green' : 'red'}]}>{caloriesRemaining}</Text>
            <Text style={styles.calorieLabelSmall}>UNDER</Text>
          </View>

        </View>

        {/* Meal Sections */}
        {Object.entries(logData.meals).map(([mealKey, meal]) => (
          <View key={mealKey} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.suggestedCalories}>{meal.suggestedCalories} calories suggested</Text>
            </View>
            {meal.items.length > 0 ? (
              meal.items.map((item, index) => (
                <View key={index} style={styles.foodItem}>
                  <Text>{item.name}</Text>
                  <Text>{item.calories} cal</Text>
                </View>
              ))
            ) : (
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>ADD {meal.name.toUpperCase()}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Water Intake */}
        <View style={styles.waterSection}>
          <Text style={styles.waterLabel}>Water Intake</Text>
          <Text style={styles.waterValue}>{logData.waterIntake} ml</Text>
        </View>

      </ScrollView>
      <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Light gray background
    },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
    header: {
      flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: 'lightgray'
    },
    dateText: {
      fontSize: 18,
        fontWeight: 'bold'
    },
  scrollContainer: {
   padding: 16
  },
  calorieSummary: {
    marginBottom: 20,
    alignItems: 'center'
  },
    calorieLabel: {
      fontSize: 16,
        fontWeight: 'bold',
        color: 'gray'
    },
    calorieRow: {
      flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%'
    },
    calorieValue: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    calorieLabelSmall:{
      fontSize: 12,
        color: 'gray',
        width: '25%',
        textAlign: 'center'

    },
  mealSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestedCalories: {
    color: 'gray',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
    addButton: {
      backgroundColor: '#007AFF', // Blue color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    addButtonText: {
      color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
  waterSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  waterLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  waterValue: {
    fontSize: 16,
  },

});

export default LogScreen;