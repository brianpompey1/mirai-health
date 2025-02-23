import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, TouchableOpacity, Alert, TextInput, Image, ImageBackground, Modal } from 'react-native';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import ExerciseItem from '../components/ExerciseItem';

const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState("Believe you can and you're halfway there.");
  const [quoteAuthor, setQuoteAuthor] = useState("Theodore Roosevelt");
  const [motivationalBackground, setMotivationalBackground] = useState('');
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2004); // From image
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(64);  // Default to 64 oz (8 cups)
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission
  const [exercise, setExercise] = useState('');
  const [exerciseSummary, setExerciseSummary] = useState('');
  const [isAddActionModalVisible, setIsAddActionModalVisible] = useState(false);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [lastWaterFetchDate, setLastWaterFetchDate] = useState(null);

  const waterUnit = 'oz';

  const displayWaterIntake = waterIntake;
  const displayWaterGoal = waterGoal;

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

  const fetchDailySummary = async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // If we've already fetched water intake today, skip the fetch
      if (lastWaterFetchDate === today) {
        return;
      }

      const { data, error } = await supabase
        .from('daily_summaries')
        .select('water_intake')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily summary:', error);
        return;
      }

      // Update the water intake and last fetch date
      setWaterIntake(data?.water_intake || 0);
      setLastWaterFetchDate(today);
      
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!userId) return;

        try {
          const today = new Date().toISOString().split('T')[0];
          
          // Fetch daily summary for water intake and exercise
          const { data: summaryData, error: summaryError } = await supabase
            .from('daily_summaries')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

          if (summaryError && summaryError.code !== 'PGRST116') {
            console.error('Error fetching daily summary:', summaryError);
          } else if (summaryData) {
            setWaterIntake(summaryData.water_intake || 0);
            setExerciseSummary(summaryData.exercise_summary || '');
          }

          // Fetch daily food log for total calories
          const { data: logData, error: logError } = await supabase
            .from('daily_food_logs')
            .select('total_protein_calories')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

          if (logError && logError.code !== 'PGRST116') {
            console.error('Error fetching daily log:', logError);
          } else if (logData) {
            setCaloriesConsumed(logData.total_protein_calories || 0);
          }

          // Fetch meals with their food items
          const { data: mealsData, error: mealsError } = await supabase
            .from('meals')
            .select(`
              id,
              type,
              time,
              food_items (
                id,
                name,
                servings
              )
            `)
            .eq('user_id', userId)
            .eq('date', today)
            .order('time', { ascending: true });

          if (mealsError) {
            console.error('Error fetching meals:', mealsError);
          } else {
            const processedMeals = mealsData?.map(meal => ({
              id: meal.id,
              type: meal.type || 'Meal',
              time: meal.time,
              foodItems: meal.food_items || []
            })) || [];
            
            setMeals(processedMeals);
          }

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, [userId])
  );

  const WATER_INCREMENT = 8; // 8 oz increment
  
  const handleAddWater = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const newWaterIntake = waterIntake + WATER_INCREMENT;
      setWaterIntake(newWaterIntake);
      
      // First check if there's an existing record for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingData, error: fetchError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching daily summary:', fetchError);
        setWaterIntake(waterIntake); // Rollback
        return;
      }

      const { error } = await supabase
        .from('daily_summaries')
        .upsert({
          ...(existingData?.id ? { id: existingData.id } : {}),
          user_id: userId,
          date: today,
          water_intake: newWaterIntake,
          exercise_summary: existingData?.exercise_summary || exerciseSummary
        });

      if (error) {
        console.error('Error updating water intake:', error);
        setWaterIntake(waterIntake); // Rollback
      }
    } catch (error) {
      console.error('Error updating water intake:', error);
      setWaterIntake(waterIntake); // Rollback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveWater = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const newWaterIntake = Math.max(0, waterIntake - WATER_INCREMENT);
      setWaterIntake(newWaterIntake);
      
      // First check if there's an existing record for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingData, error: fetchError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching daily summary:', fetchError);
        setWaterIntake(waterIntake); // Rollback
        return;
      }

      const { error } = await supabase
        .from('daily_summaries')
        .upsert({
          ...(existingData?.id ? { id: existingData.id } : {}),
          user_id: userId,
          date: today,
          water_intake: newWaterIntake,
          exercise_summary: existingData?.exercise_summary || exerciseSummary
        });

      if (error) {
        console.error('Error updating water intake:', error);
        setWaterIntake(waterIntake); // Rollback
      }
    } catch (error) {
      console.error('Error updating water intake:', error);
      setWaterIntake(waterIntake); // Rollback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveExercise = async () => {
    if (!userId || isSubmitting || !exercise.trim()) return;

    try {
      setIsSubmitting(true);
      const today = new Date().toISOString().split('T')[0];

      // First check if there's an existing record for today
      const { data: existingData, error: fetchError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching daily summary:', fetchError);
        return;
      }

      // Prepare the new exercise summary
      const newExerciseSummary = existingData?.exercise_summary 
        ? `${existingData.exercise_summary}\n${exercise.trim()}`
        : exercise.trim();

      // Prepare the data for upsert
      const summaryData = {
        ...(existingData?.id ? { id: existingData.id } : {}),
        user_id: userId,
        date: today,
        exercise_summary: newExerciseSummary,
        water_intake: existingData?.water_intake || waterIntake
      };

      const { error } = await supabase
        .from('daily_summaries')
        .upsert(summaryData);

      if (error) {
        console.error('Error saving exercise:', error);
        Alert.alert('Error', 'Failed to save exercise');
        return;
      }

      setExerciseSummary(newExerciseSummary);
      setExercise(''); // Clear input
      setIsExerciseModalVisible(false); // Close modal
      Alert.alert('Success', 'Exercise saved successfully');

    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Error', 'An unexpected error occurred');
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

  const handleEditMeal = (meal) => {
    // Navigate to edit meal screen with meal data
    navigation.navigate('AddFood', { meal });
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      // Refresh meals data
      fetchData();
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Error', 'Failed to delete meal');
    }
  };

  const handleEditExercise = (exercise) => {
    // Navigate to edit exercise screen with exercise data
    navigation.navigate('AddExercise', { exercise });
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      // First get the current exercise summary
      const today = new Date().toISOString().split('T')[0];
      const { data: summaryData } = await supabase
        .from('daily_summaries')
        .select('exercise_summary')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (summaryData) {
        // Remove the exercise from the summary
        const exercises = summaryData.exercise_summary
          .split(',')
          .map(ex => ex.trim())
          .filter(ex => ex !== '');
        
        const updatedExercises = exercises.filter(ex => ex !== exerciseId);
        
        // Update the daily summary
        const { error } = await supabase
          .from('daily_summaries')
          .update({ exercise_summary: updatedExercises.join(', ') })
          .eq('user_id', userId)
          .eq('date', today);

        if (error) throw error;

        // Refresh exercise data
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      Alert.alert('Error', 'Failed to delete exercise');
    }
  };

  const renderExerciseModal = () => (
    <Modal
      visible={isExerciseModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsExerciseModalVisible(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Exercise</Text>
            <TouchableOpacity 
              onPress={() => setIsExerciseModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[
              styles.exerciseInput,
              { 
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            placeholder="What exercise did you do today?"
            placeholderTextColor={theme.textSecondary}
            value={exercise}
            onChangeText={setExercise}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.importantButton,
                opacity: exercise.trim() ? 1 : 0.5
              }
            ]}
            onPress={handleSaveExercise}
            disabled={!exercise.trim() || isSubmitting}
          >
            <Text style={[styles.saveButtonText, { color: theme.importantButtonText }]}>
              {isSubmitting ? 'Saving...' : 'Save Exercise'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1 }}>
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header with Profile and Welcome */}
          <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {profilePicture ? (
                  <Image 
                    source={{ uri: profilePicture }} 
                    style={styles.profilePicture}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.profilePlaceholder, { backgroundColor: theme.primary }]}>
                    <Text style={styles.profileInitial}>
                      {userName ? userName[0].toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.headerTextContainer}>
                <View style={styles.welcomeContainer}>
                  <Text style={[styles.greetingText, { color: theme.text }]}>
                    Welcome back
                  </Text>
                  <Text style={[styles.nameText, { color: theme.text }]}>
                    {userName || 'there'}!
                  </Text>
                </View>
                <Text style={[styles.dateText, { color: theme.text }]}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Motivation Card */}
          <MotivationCard
            quote={motivationalQuote}
            author={quoteAuthor}
            backgroundImage={motivationalBackground}
            theme={theme}
          />

          {/* Calories Progress */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Protein Calories</Text>
            <View style={styles.calorieContainer}>
              <Text style={[styles.calorieText, { color: theme.text }]}>
                {caloriesConsumed} / {calorieGoal}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((caloriesConsumed / calorieGoal) * 100, 100)}%`,
                      backgroundColor: theme.primary
                    }
                  ]}
                />
              </View>
              <Text style={[styles.remainingText, { color: theme.text }]}>
                {calorieGoal - caloriesConsumed} calories remaining
              </Text>
            </View>
          </View>

          {/* Macronutrient Breakdown
          <MacronutrientBreakdown
            protein={protein}
            carbs={carbs}
            fat={fat}
            theme={theme}
          /> */}

          {/* Today's Meals */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Meals</Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: theme.importantButton,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => navigation.navigate('AddFood')}
              >
                <Text style={[styles.addButtonText, { color: theme.importantButtonText }]}>+ Add Meal</Text>
              </TouchableOpacity>
            </View>
            {Array.isArray(meals) && meals.length > 0 ? (
              meals.map((meal) => (
                <MealCard 
                  key={meal.id} 
                  meal={meal} 
                  onEdit={handleEditMeal}
                  onDelete={handleDeleteMeal}
                />
              ))
            ) : (
              <Text style={[styles.noMealsText, { color: theme.text }]}>
                No meals logged yet today
              </Text>
            )}
          </View>

          {/* Water Intake */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Water Intake</Text>
              <View style={styles.waterControls}>
                <TouchableOpacity
                  style={[
                    styles.waterButton,
                    {
                      backgroundColor: theme.importantButton,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={handleRemoveWater}
                >
                  <Text style={[styles.waterButtonText, { color: theme.importantButtonText }]}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.waterButton,
                    {
                      backgroundColor: theme.importantButton,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={handleAddWater}
                >
                  <Text style={[styles.waterButtonText, { color: theme.importantButtonText }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.waterContainer}>
              <Text style={[styles.waterText, { color: theme.text }]}>
                {displayWaterIntake} / {displayWaterGoal} {waterUnit}
              </Text>
              <View style={styles.waterProgressContainer}>
                <View style={styles.waterProgressBackground}>
                  <View
                    style={[
                      styles.waterProgressFill,
                      {
                        width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%`,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.waterRemainingText}>
                  {Math.max(waterGoal - waterIntake, 0)} {waterUnit} remaining
                </Text>
              </View>
            </View>
          </View>

          {/* Exercise Section */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Exercise</Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: theme.importantButton,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => navigation.navigate('AddExercise')}
              >
                <Text style={[styles.addButtonText, { color: theme.importantButtonText }]}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>
            {exerciseSummary ? (
              exerciseSummary.split(',').map((exercise, index) => (
                <ExerciseItem
                  key={index}
                  exercise={{ id: index, name: exercise.trim() }}
                  onEdit={handleEditExercise}
                  onDelete={handleDeleteExercise}
                />
              ))
            ) : (
              <Text style={[styles.noExerciseText, { color: theme.text }]}>
                No exercises logged yet today
              </Text>
            )}
          </View>
        </ScrollView>
        
        {/* Complete Day Button - Now outside ScrollView */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            {
              backgroundColor: theme.importantButton,
              marginHorizontal: 20,
              marginBottom: 40,
            },
          ]}
          onPress={() => {
            // Handle complete day action
            Alert.alert('Complete Day', 'Are you sure you want to complete this day?', [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => {
                  // Add your complete day logic here
                  Alert.alert('Success', 'Day completed successfully!');
                },
              },
            ]);
          }}
        >
          <Text style={[styles.completeButtonText, { color: theme.importantButtonText }]}>
            Complete Day
          </Text>
        </TouchableOpacity>
      </View>

      {renderExerciseModal()}
      {isAddActionModalVisible && (
        <AddActionModal
          onClose={() => setIsAddActionModalVisible(false)}
          onAddFood={() => navigation.navigate('AddFood')}
          onAddExercise={() => setIsExerciseModalVisible(true)}
          theme={theme}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#f0f0f0', // Light gray background
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profilePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
    marginTop: 2,
  },
  section: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calorieContainer: {
    alignItems: 'center',
  },
  calorieText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  remainingText: {
    fontSize: 16,
    marginTop: 5,
  },
  noMealsText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  waterContainer: {
    alignItems: 'center',
    width: '100%',
  },
  waterText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  waterProgressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  waterProgressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E6F3FF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  waterRemainingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  waterButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
  },
  exerciseSummary: {
    fontSize: 16,
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 15,
  },
  noExerciseText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  completeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  exerciseInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;