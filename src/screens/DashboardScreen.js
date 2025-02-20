import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import DashboardHeader from '../components/DashboardHeader';
import MotivationCard from '../components/MotivationCard';
import CalorieProgress from '../components/CalorieProgress';
import WaterIntake from '../components/WaterIntake';
import MacronutrientBreakdown from '../components/MacronutrientBreakdown';
import MealCard from '../components/MealCard';
import { supabase } from '../utils/supabase';

const DashboardScreen = () => {
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState("Believe you can and you're halfway there.");
  const [quoteAuthor, setQuoteAuthor] = useState("Theodore Roosevelt");
  const [motivationalBackground, setMotivationalBackground] = useState('');
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [totalCalories, setTotalCalories] = useState(2004); // From image
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(3000);  // Example goal
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

    useEffect(() => {
      const fetchUser = async() => {
        setLoading(true);
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if(error) {
               console.error("Error fetching user", error)
                Alert.alert("Error", "Could not get user session")
            }
            if(user) {
                setUserId(user.id)
                const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('first_name, profile_picture')
                .eq('id', user.id)
                .single();

              if (profileError) {
                console.error('Error fetching profile:', profileError);
                Alert.alert('Error', 'Failed to fetch profile data.');
                return;
              }
              if(profileData){
                setUserName(profileData.first_name);
                setProfilePicture(profileData.profile_picture);
              }

            }
        } catch(error) {
          console.error("Unexpected Error getting user:", error);
          Alert.alert("Error", "An unexpected error occurred")

        } finally {
            setLoading(false)
        }
      }
      fetchUser();
    }, [])


    useEffect(() => {
      const fetchMeals = async() => {
        if(!userId) return;

        try {
            const {data, error} = await supabase
              .from('meals')
              .select(`
                id,
                time,
                type,
                totalCalories,
                food_items (
                    id,
                    name,
                    calories,
                    protein,
                    carbs,
                    fat
                )
              `)
              .eq('user_id', userId)
              .eq('date', new Date().toISOString().split('T')[0]) // Today's meals
              .order('time', {ascending: true})

            if(error) {
                console.error("Error fetching meals", error);
                Alert.alert("Error", "Could not get meals")
                return;
            }
            //Transform data
            const transformedMeals = data.reduce((acc, meal) => {
                const mealType = meal.type;
                const mealItems = meal.food_items.map(item => ({
                    name: item.name,
                    calories: item.calories
                }));

                if(!acc[mealType]) {
                    acc[mealType] = {
                        name: mealType.charAt(0).toUpperCase() + mealType.slice(1), // Capitalize
                        items: mealItems
                    }
                } else {
                    acc[mealType].items = [...acc[mealType].items, ...mealItems]
                }
                return acc;

            }, {});

            const mealsArray = Object.values(transformedMeals);
            setMeals(mealsArray);

            // Calculate totals
            let totalCals = 0;
            let totalProtein = 0;
            let totalCarbs = 0;
            let totalFat = 0;

            data.forEach(meal => {
              meal.food_items.forEach(item => {
                totalCals += item.calories;
                totalProtein += item.protein || 0;  // Handle potential nulls
                totalCarbs += item.carbs || 0;
                totalFat += item.fat || 0;
              });
            });

            setCaloriesConsumed(totalCals);
            setProtein(totalProtein);
            setCarbs(totalCarbs);
            setFat(totalFat);


        } catch(error){
          console.error("Unexpected Error", error);
          Alert.alert("Error", "An unexpected error occured.");
        }
      }
      fetchMeals();

    }, [userId])


  const handleAddWater = () => {
    setWaterIntake((prevIntake) => prevIntake + 250); // Increase by 250ml
    //TODO: Update in the database
  };

  const handleRemoveWater = () => {
    setWaterIntake((prevIntake) => Math.max(0, prevIntake - 250)); // Decrease by 250ml, but don't go below 0
    //TODO: Update in database
  };

    if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
        </View>
        );
    }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <DashboardHeader userName={userName} profilePicture={profilePicture} />
        <MotivationCard quote={motivationalQuote} author={quoteAuthor} backgroundImage={motivationalBackground} />

        {/* Calories Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calories</Text>
          <CalorieProgress consumed={caloriesConsumed} total={totalCalories} />
          <Text style={styles.cardSubtitle}>{totalCalories - caloriesConsumed} Calories Remaining</Text>
        </View>

        {/* Water Intake Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Water Intake</Text>
          <WaterIntake intake={waterIntake} goal={waterGoal} onAddWater={handleAddWater} onRemoveWater={handleRemoveWater}/>
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
        <View style={{height: 80}}></View>
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