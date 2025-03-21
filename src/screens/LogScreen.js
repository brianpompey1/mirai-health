import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { supabase } from "../utils/supabase";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useTheme } from "../contexts/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ExerciseItem from "../components/ExerciseItem";
import MealCard from "../components/MealCard";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  dateNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  dateButtonDisabled: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
  },
  dateTouchable: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  calendarIcon: {
    marginLeft: 4,
  },
  mealsContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  exerciseContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  noDataText: {
    textAlign: "center",
    padding: 16,
    fontSize: 14,
    fontStyle: "italic",
  },
  summarySection: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  waterContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 15,
  },
  waterText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  waterProgressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  waterProgressBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#E6F3FF",
    borderRadius: 6,
    overflow: "hidden",
  },
  waterProgressFill: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 6,
  },
  waterControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  waterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  waterButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 24,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: "100%",
    borderRadius: 8,
  },
  editAction: {
    backgroundColor: "#4A90E2",
    marginRight: 8,
  },
  deleteAction: {
    backgroundColor: "#FF3B30",
  },
  mealItemContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  exerciseItemContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  exerciseInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

const getLocalDateString = (date) => {
  // Create a new date object in local timezone
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const LogScreen = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(64); // Default to 64 oz (8 cups)
  const [exerciseSummary, setExerciseSummary] = useState("");
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [totalVegetableServings, setTotalVegetableServings] = useState(0);
  const [totalFruitServings, setTotalFruitServings] = useState(0);
  const waterUnit = "oz";
  const WATER_INCREMENT = 8; // 8 oz increment
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [exercise, setExercise] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const { theme } = useTheme();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkStructure = async () => {
      // Debug: Check food_items table structure
      const { data, error } = await supabase
        .from("food_items")
        .select("*")
        .limit(1);

      if (data && data.length > 0) {
        console.log("Food item structure:", data[0]);
      }
      if (error) {
        console.error("Error checking structure:", error);
      }
    };

    checkStructure();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  const getFoodType = (foodName) => {
    const name = foodName.toLowerCase();
    // List of common vegetables (both singular and plural forms)
    const vegetables = [
      "broccoli", "spinach", "kale", "carrot", "carrots",
      "lettuce", "cucumber", "cucumbers", "tomato", "tomatoes",
      "celery", "pepper", "peppers", "onion", "onions",
      "garlic"
    ];
    // List of common fruits (both singular and plural forms)
    const fruits = [
      "apple", "apples", "banana", "bananas", "orange", "oranges",
      "grape", "grapes", "berry", "berries", "strawberry", "strawberries",
      "blueberry", "blueberries", "pear", "pears", "peach", "peaches",
      "plum", "plums", "mango", "mangoes", "mangos"
    ];
    // List of protein foods
    const veryLeanProteins = ["egg white", "egg whites", "fish", "tuna", "cod", "tilapia"];
    const leanProteins = ["chicken", "turkey", "lean beef"];
    const mediumFatProteins = ["salmon", "beef", "pork"];
    const proteinAlternatives = ["tofu", "tempeh", "seitan", "beans", "lentils"];

    if (vegetables.some((veg) => name.includes(veg))) return "vegetable";
    if (fruits.some((fruit) => name.includes(fruit))) return "fruit";
    if (veryLeanProteins.some((protein) => name.includes(protein))) return "very_lean_protein";
    if (leanProteins.some((protein) => name.includes(protein))) return "lean_protein";
    if (mediumFatProteins.some((protein) => name.includes(protein))) return "medium_fat_protein";
    if (proteinAlternatives.some((protein) => name.includes(protein))) return "protein_alternative";

    return "other";
  };

  const fetchData = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const dateString = getLocalDateString(selectedDate);

      console.log("Fetching meals for date:", dateString);

      // Fetch meals with their food items
      const { data: mealsData, error: mealsError } = await supabase
        .from("meals")
        .select("*, food_items(*)")
        .eq("user_id", userId)
        .eq("date", dateString)
        .order("time", { ascending: true });

      if (mealsError) {
        console.error("Error fetching meals:", mealsError);
        return;
      }

      console.log("Fetched meals:", mealsData);

      // Calculate totals
      let totalVegetableServings = 0;
      let totalFruitServings = 0;
      let totalProteinCalories = 0;

      console.log("Starting to process meals for servings calculation");
      mealsData?.forEach((meal) => {
        console.log("Processing meal:", meal.type);
        meal.food_items?.forEach((item) => {
          const foodType = getFoodType(item.name);
          console.log("Food item:", item.name, "Type:", foodType, "Servings:", item.servings);

          if (foodType === "vegetable") {
            totalVegetableServings += item.servings;
            console.log("Added vegetable servings. New total:", totalVegetableServings);
          } else if (foodType === "fruit") {
            totalFruitServings += item.servings;
            console.log("Added fruit servings. New total:", totalFruitServings);
          }

          // Calculate protein calories based on type
          switch (foodType) {
            case "very_lean_protein":
              totalProteinCalories += item.servings * 35;
              break;
            case "lean_protein":
              totalProteinCalories += item.servings * 55;
              break;
            case "medium_fat_protein":
              totalProteinCalories += item.servings * 75;
              break;
            case "protein_alternative":
              totalProteinCalories += item.servings * 45;
              break;
          }
        });
      });

      // Transform meals data to match the expected format
      const transformedMeals =
        mealsData?.map((meal) => ({
          id: meal.id,
          type: meal.type || "Meal",
          time: meal.time,
          foodItems: meal.food_items || [],
        })) || [];

      console.log("Transformed meals:", transformedMeals);

      setMeals(transformedMeals);
      setTotalVegetableServings(totalVegetableServings);
      setTotalFruitServings(totalFruitServings);
      setCaloriesConsumed(totalProteinCalories);

      // Fetch daily summary
      const { data: summaryData, error: summaryError } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateString)
        .single();

      if (summaryError && summaryError.code !== "PGRST116") {
        console.error("Error fetching daily summary:", summaryError);
      } else {
        setWaterIntake(summaryData?.water_intake || 0);
        setExerciseSummary(summaryData?.exercise_summary || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userId, selectedDate])
  );

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow future dates
    if (date > today) {
      date = today;
    }

    handleDateChange(date);
    hideDatePicker();
  };

  const formatDate = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Reset states for the new date
    setMeals([]);
    setWaterIntake(0);
    setExerciseSummary("");
    setCaloriesConsumed(0);
    setTotalVegetableServings(0);
    setTotalFruitServings(0);
    // Fetch data for the new date will happen via useEffect
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    handleDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    const today = new Date();
    // Don't allow selecting future dates
    if (newDate <= today) {
      handleDateChange(newDate);
    }
  };

  const handleEditMeal = (meal) => {
    navigation.navigate("AddFood", {
      editMode: true,
      mealId: meal.id,
      mealType: meal.type || "",
      mealTime: meal.time || "",
      foodItems: Array.isArray(meal.foodItems) ? meal.foodItems : [],
    });
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      // First delete associated food items
      const { error: deleteItemsError } = await supabase
        .from("food_items")
        .delete()
        .eq("meal_id", mealId);

      if (deleteItemsError) {
        console.error("Error deleting food items:", deleteItemsError);
        Alert.alert("Error", "Failed to delete meal items");
        return;
      }

      // Then delete the meal
      const { error: deleteMealError } = await supabase
        .from("meals")
        .delete()
        .eq("id", mealId);

      if (deleteMealError) {
        console.error("Error deleting meal:", deleteMealError);
        Alert.alert("Error", "Failed to delete meal");
        return;
      }

      // Update the local state to remove the deleted meal
      setMeals(meals.filter((meal) => meal.id !== mealId));
      Alert.alert("Success", "Meal deleted successfully");
    } catch (error) {
      console.error("Error in handleDeleteMeal:", error);
      Alert.alert("Error", "Failed to delete meal");
    }
  };

  const handleEditExercise = (exercise) => {
    setExercise(exercise.name);
    setEditingExerciseId(exercise.name);
    setIsExerciseModalVisible(true);
  };

  const handleDeleteExercise = async (index) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const dateString = getLocalDateString(selectedDate);

      const { data: existingSummary } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateString)
        .single();

      if (existingSummary) {
        const exercises = existingSummary.exercise_summary
          .split(",")
          .map((ex) => ex.trim());
        exercises.splice(index, 1);
        const updatedExercises = exercises.join(",");

        const { error: updateError } = await supabase
          .from("daily_summaries")
          .update({ exercise_summary: updatedExercises })
          .eq("id", existingSummary.id);

        if (updateError) throw updateError;
        fetchData(); // Refresh the data
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      Alert.alert("Error", "Failed to delete exercise");
    }
  };

  const renderRightActions = (meal) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.rightAction, styles.editAction]}
          onPress={() => handleEditMeal(meal)}
        >
          <Ionicons name="pencil" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rightAction, styles.deleteAction]}
          onPress={() => handleDeleteMeal(meal.id)}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMealItem = (meal) => {
    return (
      <MealCard
        key={meal.id}
        meal={{
          ...meal,
          food_items: meal.foodItems,
        }}
        onEdit={handleEditMeal}
        onDelete={handleDeleteMeal}
        theme={theme}
      />
    );
  };

  const renderSummary = () => {
    if (!meals || meals.length === 0) return null;

    // Calculate progress percentages
    const proteinProgress = Math.min((caloriesConsumed / 2000) * 100, 100);
    const vegetableProgress = Math.min((totalVegetableServings / 2) * 100, 100);
    const fruitProgress = Math.min((totalFruitServings / 1) * 100, 100);

    return (
      <View
        style={[
          styles.summarySection,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Daily Summary
        </Text>

        {/* Protein Calories */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelContainer}>
            <Text style={[styles.progressLabel, { color: theme.text }]}>
              Protein Calories
            </Text>
            <Text style={[styles.progressValue, { color: theme.text }]}>
              {caloriesConsumed} / 2000
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${proteinProgress}%`,
                  backgroundColor:
                    proteinProgress >= 100 ? theme.success : theme.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Vegetable Servings */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelContainer}>
            <Text style={[styles.progressLabel, { color: theme.text }]}>
              Vegetable Servings
            </Text>
            <Text style={[styles.progressValue, { color: theme.text }]}>
              {totalVegetableServings} / 2
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${vegetableProgress}%`,
                  backgroundColor:
                    vegetableProgress >= 100 ? theme.success : theme.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Fruit Servings */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelContainer}>
            <Text style={[styles.progressLabel, { color: theme.text }]}>
              Fruit Servings
            </Text>
            <Text style={[styles.progressValue, { color: theme.text }]}>
              {totalFruitServings} / 1
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${fruitProgress}%`,
                  backgroundColor:
                    fruitProgress >= 100 ? theme.success : theme.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Water Intake */}
        <View style={styles.waterContainer}>
          <Text style={[styles.waterText, { color: theme.text }]}>
            {waterIntake} / {waterGoal} {waterUnit}
          </Text>
          <View style={styles.waterProgressContainer}>
            <View style={styles.waterProgressBackground}>
              <View
                style={[
                  styles.waterProgressFill,
                  {
                    width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.waterRemainingText}>
              {Math.max(waterGoal - waterIntake, 0)} {waterUnit} remaining
            </Text>
          </View>
          <View style={styles.waterControls}>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={handleRemoveWater}
            >
              <Text style={styles.waterButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={handleAddWater}
            >
              <Text style={styles.waterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise Summary */}
        {exerciseSummary && (
          <View style={styles.exerciseSection}>
            <Text style={[styles.exerciseTitle, { color: theme.text }]}>
              Exercise
            </Text>
            <Text style={[styles.exerciseText, { color: theme.text }]}>
              {exerciseSummary}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const handleAddWater = async () => {
    if (isSubmitting || !userId) return;

    try {
      setIsSubmitting(true);
      const newWaterIntake = waterIntake + WATER_INCREMENT;
      setWaterIntake(newWaterIntake);

      const dateString = getLocalDateString(selectedDate);
      const { data: existingData, error: fetchError } = await supabase
        .from("daily_summaries")
        .select("id")
        .eq("user_id", userId)
        .eq("date", dateString)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching daily summary:", fetchError);
        setWaterIntake(waterIntake);
        return;
      }

      const { error } = await supabase.from("daily_summaries").upsert({
        ...(existingData?.id ? { id: existingData.id } : {}),
        user_id: userId,
        date: dateString,
        water_intake: newWaterIntake,
        exercise_summary: exerciseSummary || "", // Preserve exercise summary
      });

      if (error) {
        console.error("Error updating water intake:", error);
        setWaterIntake(waterIntake);
      }
    } catch (error) {
      console.error("Error updating water intake:", error);
      setWaterIntake(waterIntake);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveWater = async () => {
    if (isSubmitting || !userId) return;

    try {
      setIsSubmitting(true);
      const newWaterIntake = Math.max(0, waterIntake - WATER_INCREMENT);
      setWaterIntake(newWaterIntake);

      const dateString = getLocalDateString(selectedDate);
      const { data: existingData, error: fetchError } = await supabase
        .from("daily_summaries")
        .select("id")
        .eq("user_id", userId)
        .eq("date", dateString)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching daily summary:", fetchError);
        setWaterIntake(waterIntake);
        return;
      }

      const { error } = await supabase.from("daily_summaries").upsert({
        ...(existingData?.id ? { id: existingData.id } : {}),
        user_id: userId,
        date: dateString,
        water_intake: newWaterIntake,
        exercise_summary: exerciseSummary || "", // Preserve exercise summary
      });

      if (error) {
        console.error("Error updating water intake:", error);
        setWaterIntake(waterIntake);
      }
    } catch (error) {
      console.error("Error updating water intake:", error);
      setWaterIntake(waterIntake);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveExercise = async () => {
    if (!exercise.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const dateString = getLocalDateString(selectedDate);

      // Check if a summary exists for this date
      const { data: existingSummary } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateString)
        .single();

      if (existingSummary) {
        // Update existing summary
        const updatedExercises = existingSummary.exercise_summary
          ? editingExerciseId !== null
            ? existingSummary.exercise_summary
                .split(",")
                .map((ex) => ex.trim())
                .map((ex, index) =>
                  index === editingExerciseId ? exercise : ex
                )
                .join(",")
            : `${existingSummary.exercise_summary}, ${exercise}`
          : exercise;

        const { error: updateError } = await supabase
          .from("daily_summaries")
          .update({ exercise_summary: updatedExercises })
          .eq("id", existingSummary.id);

        if (updateError) throw updateError;
      } else {
        // Create new summary
        const { error: insertError } = await supabase
          .from("daily_summaries")
          .insert([
            {
              user_id: user.id,
              date: dateString,
              exercise_summary: exercise,
              water_intake: 0,
            },
          ]);

        if (insertError) throw insertError;
      }

      setExercise("");
      setEditingExerciseId(null);
      setIsExerciseModalVisible(false);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error saving exercise:", error);
      Alert.alert("Error", "Failed to save exercise");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderExerciseModal = () => (
    <Modal
      visible={isExerciseModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setExercise("");
        setEditingExerciseId(null);
        setIsExerciseModalVisible(false);
      }}
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingExerciseId ? "Edit Exercise" : "Add Exercise"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setExercise("");
                setEditingExerciseId(null);
                setIsExerciseModalVisible(false);
              }}
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
                borderColor: theme.border,
              },
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
                opacity: exercise.trim() ? 1 : 0.5,
              },
            ]}
            onPress={handleSaveExercise}
            disabled={!exercise.trim() || isSubmitting}
          >
            <Text
              style={[
                styles.saveButtonText,
                { color: theme.importantButtonText },
              ]}
            >
              {isSubmitting
                ? "Saving..."
                : editingExerciseId
                ? "Update Exercise"
                : "Save Exercise"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      {renderExerciseModal()}
      <View style={styles.container}>
        {/* Date Navigation */}
        <View
          style={[
            styles.dateNavigation,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <TouchableOpacity
            onPress={handlePreviousDay}
            style={styles.dateButton}
          >
            <Text style={[styles.dateButtonText, { color: theme.text }]}>
              ←
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showDatePicker}
            style={styles.dateTouchable}
          >
            <Text style={[styles.dateText, { color: theme.text }]}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Ionicons
              name="calendar"
              size={20}
              color={theme.text}
              style={styles.calendarIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNextDay}
            style={[
              styles.dateButton,
              selectedDate.toDateString() === new Date().toDateString() &&
                styles.dateButtonDisabled,
            ]}
            disabled={selectedDate.toDateString() === new Date().toDateString()}
          >
            <Text
              style={[
                styles.dateButtonText,
                {
                  color:
                    selectedDate.toDateString() === new Date().toDateString()
                      ? theme.border
                      : theme.text,
                },
              ]}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={selectedDate}
          maximumDate={new Date()}
          textColor={theme.text}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { backgroundColor: theme.background },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {renderSummary()}

          <View
            style={[
              styles.mealsContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Meals
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: theme.importantButton },
                ]}
                onPress={() =>
                  navigation.navigate("AddFood", {
                    selectedDate: selectedDate.toISOString().split("T")[0],
                  })
                }
              >
                <Text
                  style={[
                    styles.addButtonText,
                    { color: theme.importantButtonText },
                  ]}
                >
                  + Add Meal
                </Text>
              </TouchableOpacity>
            </View>
            {Array.isArray(meals) && meals.length > 0 ? (
              meals.map((meal) => (
                <View key={meal.id} style={styles.mealItemContainer}>
                  <Swipeable
                    renderRightActions={() => renderRightActions(meal)}
                    friction={2}
                    rightThreshold={40}
                  >
                    {renderMealItem(meal)}
                  </Swipeable>
                </View>
              ))
            ) : (
              <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                No meals logged for this day
              </Text>
            )}
          </View>

          <View
            style={[
              styles.exerciseContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Exercise
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: theme.importantButton },
                ]}
                onPress={() => setIsExerciseModalVisible(true)}
              >
                <Text
                  style={[
                    styles.addButtonText,
                    { color: theme.importantButtonText },
                  ]}
                >
                  + Add Exercise
                </Text>
              </TouchableOpacity>
            </View>
            {exerciseSummary ? (
              exerciseSummary.split(",").map((exercise, index) => (
                <View key={index} style={styles.exerciseItemContainer}>
                  <ExerciseItem
                    exercise={{ id: index, name: exercise.trim() }}
                    onEdit={handleEditExercise}
                    onDelete={() => handleDeleteExercise(index)}
                  />
                </View>
              ))
            ) : (
              <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                No exercises logged for this day
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LogScreen;
