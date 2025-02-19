import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native'; // Import Text and TouchableOpacity
import DashboardHeader from '../components/DashboardHeader';
import MotivationCard from '../components/MotivationCard';
import CalorieProgress from '../components/CalorieProgress';
import WaterIntake from '../components/WaterIntake';
import MacronutrientBreakdown from '../components/MacronutrientBreakdown';
import MealCard from '../components/MealCard';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = () => {
  // Test Data (Replace with data from your backend/state management)
  const [userName, setUserName] = useState('Brian');
  const [profilePicture, setProfilePicture] = useState(''); //  URL or local path to image
  const [motivationalQuote, setMotivationalQuote] = useState("Believe you can and you're halfway there.");
  const [quoteAuthor, setQuoteAuthor] = useState("Theodore Roosevelt");
  const [motivationalBackground, setMotivationalBackground] = useState('');
  const [caloriesConsumed, setCaloriesConsumed] = useState(1596);  // Example data
  const [totalCalories, setTotalCalories] = useState(3600);
  const [waterIntake, setWaterIntake] = useState(2250); // in milliliters
  const [waterGoal, setWaterGoal] = useState(3000);
  const [protein, setProtein] = useState(120); // in grams
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(60);
    const [meals, setMeals] = useState([
    {
      name: 'Breakfast',
      items: [
        { name: 'Oatmeal with Berries', calories: 350 },
        { name: 'Greek Yogurt', calories: 150 },
      ],
    },
    {
      name: 'Lunch',
      items: [
        { name: 'Grilled Chicken Salad', calories: 500 },
        { name: 'Whole Wheat Bread', calories: 100 },
      ],
    },
    {
      name: 'Dinner',
      items: [
        { name: 'Salmon with Roasted Vegetables', calories: 600 },
        { name: 'Brown Rice', calories: 200 },
      ],
    },
      {
        name: 'Snacks',
        items: [
            {name: 'Apple', calories: 95},
            {name: 'Almonds', calories: 100}
        ]
      }
  ]);

  const handleRemoveWater = () => {
    setWaterIntake((prevIntake) => Math.max(0, prevIntake - 250)); // Decrease by 250ml, but don't go below 0
  };

    const handleAddWater = () => {
        setWaterIntake(prevIntake => prevIntake + 250) //Add 250ml for example
    }

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
            <DashboardHeader userName={userName} profilePicture={profilePicture} />
            <MotivationCard quote={motivationalQuote} author={quoteAuthor}  backgroundImage={motivationalBackground}/>

            {/* Calories Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Calories</Text>
                <CalorieProgress consumed={caloriesConsumed} total={totalCalories} />
                <Text style={styles.cardSubtitle}>{totalCalories - caloriesConsumed} Calories Remaining</Text>
            </View>
            
            {/* Water Intake Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Water Intake</Text>
                <WaterIntake 
                    intake={waterIntake} 
                    goal={waterGoal} 
                    onAddWater={handleAddWater}
                    onRemoveWater={handleRemoveWater}
                />
            </View>

            {/* Macronutrient Breakdown Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Macronutrients</Text>
                <MacronutrientBreakdown protein={protein} carbs={carbs} fat={fat} />
            </View>

             {/* Today's Foods (Meal Cards) */}
            <View style={styles.mealsContainer}>
                <Text style={styles.mealsTitle}>Today's Foods</Text>
                {meals.map((meal, index) => (
                    <MealCard key={index} mealName={meal.name} items={meal.items} />
                ))}
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Light gray background
    },
    container: {
        flexGrow: 1,
        padding: 10,

    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: 'sans-serif-medium',
        marginBottom: 10,
    },
    cardSubtitle: {
        fontSize: 16,
        fontFamily: 'sans-serif',
        color: 'gray',
        textAlign: 'center'
    },
    mealsContainer: {
        marginTop: 20,
        marginBottom: 20
    },
    mealsTitle: {
        fontSize: 20,
        fontFamily: 'sans-serif-medium',
        marginBottom: 10,
        marginLeft: 15,
    },

});

export default DashboardScreen;