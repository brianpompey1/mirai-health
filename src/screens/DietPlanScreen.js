import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DietPlanScreen = ({ route }) => {
  // Get the diet plan data from the navigation params.  This is how we'll pass
  // the data from ProfileScreen to DietPlanScreen.
  const { dietPlan } = route.params || { dietPlan: null };

  if (!dietPlan) {
    return (
      <View style={styles.container}>
        <Text>No diet plan data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Current Diet Plan</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Name:</Text>
        <Text style={styles.detail}>{dietPlan.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calorie Target:</Text>
        <Text style={styles.detail}>{dietPlan.calorieTarget} kcal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macronutrient Breakdown:</Text>
        <Text style={styles.detail}>Protein: {dietPlan.proteinTarget}g</Text>
        <Text style={styles.detail}>Carbs: {dietPlan.carbsTarget}g</Text>
        <Text style={styles.detail}>Fat: {dietPlan.fatTarget}g</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allowed Foods:</Text>
          {/*Render as a list*/}
        {dietPlan.allowedFoods.map((food, index) => (
            <Text style={styles.detail} key={index}>{food}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restricted Foods:</Text>
        {/*Render as a list*/}
        {dietPlan.restrictedFoods.map((food, index) => (
            <Text style={styles.detail} key={index}>{food}</Text>
        ))}
      </View>

      {/* Add more details as needed (e.g., meal plans, recipes) */}
        <View style={{height: 30}}></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'sans-serif-medium',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    fontFamily: 'sans-serif',
    marginBottom: 5,
  },
});

export default DietPlanScreen;