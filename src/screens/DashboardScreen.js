import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, TouchableOpacity, Alert, TextInput } from 'react-native';
import DashboardHeader from '../components/DashboardHeader';
import MotivationCard from '../components/MotivationCard';
import CalorieProgress from '../components/CalorieProgress';
import WaterIntake from '../components/WaterIntake';
import MacronutrientBreakdown from '../components/MacronutrientBreakdown';
import MealCard from '../components/MealCard';
import { supabase } from '../utils/supabase';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Import useFocusEffect and useNavigation
import AddActionModal from '../components/AddActionModal';
import { useTheme } from '../contexts/ThemeContext';

const DashboardScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState("Believe you can and you're halfway there.");
  const [quoteAuthor, setQuoteAuthor] = useState("Theodore Roosevelt");
  const [motivationalBackground, setMotivationalBackground] = useState('');
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [totalCalories, setTotalCalories] = useState(2004); // From image
  const [waterIntake, setWaterIntake] = useState(0); // Store in ml internally
  const [waterGoal, setWaterGoal] = useState(64);  // Default to 64 oz (8 cups)
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission
  const [waterUnit, setWaterUnit] = useState('oz'); // Default to oz
  const [exercise, setExercise] = useState('');
  const [exerciseSummary, setExerciseSummary] = useState('');
  const [isAddActionModalVisible, setIsAddActionModalVisible] = useState(false);

  // Conversion functions
  const ozToMl = (oz) => oz * 29.5735;
  const mlToOz = (ml) => ml / 29.5735;

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

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {

        if (!userId) return;

        setLoading(true); // Show loading indicator
        try {
          const { data, error } = await supabase
            .from('meals')
            .select(`
              id,
              time,
              type,
              food_items (
                id,
                name,
                servings
              )
            `)
            .eq('user_id', userId)
            .eq('date', new Date().toISOString().split('T')[0])
            .order('time', { ascending: true });

          if (error) {
            console.error('Error fetching meals:', error);
            Alert.alert('Error', 'Failed to fetch meals');
            return;
          }

          // Transform meals data for MealCard
          const transformedMeals = data?.reduce((acc, meal) => {
            const mealType = meal.type;
            if (!acc[mealType]) {
              acc[mealType] = {
                name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
                items: []
              };
            }
            
            meal.food_items?.forEach(item => {
              acc[mealType].items.push({
                name: item.name,
                servings: item.servings,
                calories: 0, // We don't have calories in food_items table
                protein: 0,  // We don't track macros
                carbs: 0,
                fat: 0
              });
            });
            
            return acc;
          }, {});

          setMeals(Object.values(transformedMeals || {}));

          // Get the daily food log to calculate totals
          const { data: logData, error: logError } = await supabase
            .from('daily_food_logs')
            .select('total_protein_calories, vegetable_servings, fruit_servings')
            .eq('user_id', userId)
            .eq('date', new Date().toISOString().split('T')[0])
            .single();

          if (logError && logError.code !== 'PGRST116') {
            console.error('Error fetching daily log:', logError);
            Alert.alert('Error', 'Failed to fetch daily totals');
            return;
          }

          // Set the totals from the daily log
          if (logData) {
            setCaloriesConsumed(logData.total_protein_calories || 0);
            setProtein((logData.total_protein_calories || 0) / 4); // Assuming 4 calories per gram of protein
          } else {
            setCaloriesConsumed(0);
            setProtein(0);
          }

          //Fetch water data.
          const {data: waterData, error: waterError} = await supabase
          .from('daily_summaries')
          .select('water_intake')
          .eq('user_id', userId)
          .eq('date', new Date().toISOString().split('T')[0])
          .single()

          if(waterError && waterError.code !== 'PGRST116') { //Ignore no data error
            console.error("Error getting water data", waterError);
            Alert.alert("Error", "Could not load water data");
            return;
          }
          if(waterData) {
            setWaterIntake(waterData.water_intake);
          }

          // Fetch exercise summary
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('daily_summaries')
            .select('exercise_summary')
            .eq('user_id', userId)
            .eq('date', new Date().toISOString().split('T')[0])
            .single();

          if (exerciseError && exerciseError.code !== 'PGRST116') {
            console.error('Error fetching exercise summary:', exerciseError);
            Alert.alert('Error', 'Could not load exercise data');
            return;
          }

          if (exerciseData) {
            setExerciseSummary(exerciseData.exercise_summary || '');
          }

        } catch (error) {
          console.error('Unexpected error fetching meals:', error);
          Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
          setLoading(false); // Hide loading indicator
        }
      };
      if(userId) {
        fetchData();
      }

      // Optional: Clean up function (runs when component unmounts or before the effect runs again)
      return () => {
        //  setLoading(false); // Reset loading state if needed.
      };
    }, [userId]) // Depend on userId
  );

  const handleAddWater = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const newIntake = Math.round(waterIntake + ozToMl(8));
      
      // First try to update existing record
      const { data, error: updateError } = await supabase
        .from('daily_summaries')
        .update({ water_intake: newIntake })
        .match({ user_id: userId, date: new Date().toISOString().split('T')[0] });

      if (updateError) {
        // If update fails (no existing record), insert new record
        const { error: insertError } = await supabase
          .from('daily_summaries')
          .insert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            water_intake: newIntake
          });

        if (insertError) {
          console.error('Error updating water intake:', insertError);
          Alert.alert('Error', 'Failed to update water intake');
          return;
        }
      }

      setWaterIntake(newIntake);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveWater = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const newIntake = Math.round(Math.max(0, waterIntake - ozToMl(8)));
      
      // First try to update existing record
      const { data, error: updateError } = await supabase
        .from('daily_summaries')
        .update({ water_intake: newIntake })
        .match({ user_id: userId, date: new Date().toISOString().split('T')[0] });

      if (updateError) {
        // If update fails (no existing record), insert new record
        const { error: insertError } = await supabase
          .from('daily_summaries')
          .insert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            water_intake: newIntake
          });

        if (insertError) {
          console.error('Error updating water intake:', insertError);
          Alert.alert('Error', 'Failed to update water intake');
          return;
        }
      }

      setWaterIntake(newIntake);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveExercise = async () => {
    if (!exercise.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newExercise = exercise.trim();
      
      // First try to update existing record
      const { data, error: updateError } = await supabase
        .from('daily_summaries')
        .update({ 
          exercise_summary: exerciseSummary 
            ? `${exerciseSummary}\n${newExercise}`  // Append new exercise
            : newExercise                           // First exercise of the day
        })
        .match({ user_id: userId, date: today })
        .select();

      if (updateError) {
        // If update fails (no existing record), insert new record
        const { error: insertError } = await supabase
          .from('daily_summaries')
          .insert({
            user_id: userId,
            date: today,
            exercise_summary: newExercise
          });

        if (insertError) throw insertError;
      }

      setExerciseSummary(prev => prev ? `${prev}\n${newExercise}` : newExercise);
      setExercise(''); // Clear input
      Alert.alert('Success', 'Exercise saved successfully!');
    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Error', 'Failed to save exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDay = async () => {
    setIsSubmitting(true);
    try {
      // Upsert into daily_summaries
      const { error: upsertError } = await supabase
        .from('daily_summaries')
        .upsert(
          {
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            total_calories: caloriesConsumed,
            total_protein: protein,
            total_carbs: carbs,
            total_fat: fat,
            water_intake: Math.round(waterIntake), // Round to nearest integer
          },
          { onConflict: 'user_id, date' }
        )
        .select();

      if (upsertError) {
        console.error('Error saving daily summary:', upsertError);
        Alert.alert('Error', 'Failed to save daily summary.');
        return;
      }

      Alert.alert('Success', 'Day completed and data saved!');
    } catch (error) {
      console.error('Error completing day:', error);
      Alert.alert('Error', 'Failed to complete the day.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get displayed water intake, based on selected unit.
  const displayWaterIntake = waterUnit === 'oz' ? mlToOz(waterIntake) : waterIntake;
  const displayWaterGoal = waterUnit == 'oz' ? waterGoal: ozToMl(waterGoal); //Goal is in oz

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.background}]}>
      <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
        <DashboardHeader userName={userName} profilePicture={profilePicture} />
        <MotivationCard quote={motivationalQuote} author={quoteAuthor} backgroundImage={motivationalBackground} />

        {/* Calories Card */}
        <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
          <Text style={[styles.cardTitle, {color: theme.text}]}>Calories</Text>
          <CalorieProgress consumed={caloriesConsumed} total={totalCalories} />
          <Text style={[styles.cardSubtitle, {color: theme.text}]}>{totalCalories - caloriesConsumed} Calories Remaining</Text>
        </View>

        {/* Water Intake Card */}
        <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
          <Text style={[styles.cardTitle, {color: theme.text}]}>Water Intake</Text>
          <WaterIntake
            intake={displayWaterIntake} // Display in selected unit
            goal={displayWaterGoal}
            onAddWater={handleAddWater}
            onRemoveWater={handleRemoveWater}
            unit={waterUnit} // Pass the unit down
            onUnitChange={setWaterUnit} // Allow changing the unit
          />
        </View>

        {/* Macronutrient Breakdown Card */}
        <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
          <Text style={[styles.cardTitle, {color: theme.text}]}>Macronutrients</Text>
          <MacronutrientBreakdown protein={protein} carbs={carbs} fat={fat} />
        </View>

        {/* Today's Foods (Meal Cards) */}
        <View style={[styles.mealsContainer, {backgroundColor: theme.cardBackground}]}>
          <Text style={[styles.mealsTitle, {color: theme.text}]}>Today's Foods</Text>
          {meals.map((meal, index) => (
            <MealCard key={index} meal={meal} />
          ))}
          {meals.length === 0 && (
            <Text style={[styles.noContentText, {color: theme.text}]}>No meals logged today</Text>
          )}
        </View>

        {/* Exercise Section */}
        <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
          <Text style={[styles.cardTitle, {color: theme.text}]}>Today's Exercise</Text>
          <View style={[styles.exerciseInputContainer, {backgroundColor: theme.cardBackground}]}>
            <TextInput
              style={[styles.exerciseInput, {color: theme.text}]}
              placeholder="What exercise did you do today?"
              value={exercise}
              onChangeText={setExercise}
              multiline
              numberOfLines={2}
            />
            <TouchableOpacity 
              style={[
                styles.addButton, 
                {backgroundColor: theme.buttonBackground}, 
                (!exercise.trim() || isSubmitting) && {backgroundColor: theme.disabledButtonBackground}
              ]}
              onPress={handleSaveExercise}
              disabled={!exercise.trim() || isSubmitting}
            >
              <Text style={[styles.addButtonText, {color: theme.text}]}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {exerciseSummary ? (
            <View style={styles.exerciseList}>
              {exerciseSummary.split('\n').map((item, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text style={[styles.exerciseText, {color: theme.text}]}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noContentText, {color: theme.text}]}>No exercises logged today</Text>
          )}
        </View>

        {/* Complete Day Button */}
        <TouchableOpacity
          style={[styles.completeDayButton, {backgroundColor: theme.buttonBackground}]}
          onPress={handleCompleteDay}
          disabled={isSubmitting}
        >
          <Text style={[styles.completeDayButtonText, {color: theme.text}]}>
            {isSubmitting ? 'Submitting...' : 'Complete Day'}
          </Text>
        </TouchableOpacity>

        <View style={{height: 80}}></View>
      </ScrollView>
      <AddActionModal
        isVisible={isAddActionModalVisible}
        onClose={() => setIsAddActionModalVisible(false)}
        onAddFood={() => {
          setIsAddActionModalVisible(false);
          navigation.navigate('Log');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#f0f0f0', // Light gray background
  },
  container: {
    flexGrow: 1,
    padding: 10,

  },
  card: {
    // backgroundColor: 'white',
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
    // color: 'gray',
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
  completeDayButton: {
    backgroundColor: '#27ae60', // A green color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center'
  },
  completeDayButtonText: {
    // color: 'white',
    fontSize: 18,
    fontFamily: 'sans-serif-medium'
  },
  exerciseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  exerciseList: {
    marginTop: 10,
  },
  exerciseItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exerciseText: {
    fontSize: 16,
    // color: '#333',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noContentText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default DashboardScreen;