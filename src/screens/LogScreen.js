import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform, Modal, TextInput, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../utils/supabase';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ExerciseItem from '../components/ExerciseItem';
import MealCard from '../components/MealCard';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 30,
        paddingHorizontal: 16,
    },
    header: {
        paddingVertical: 15,
        marginBottom: 15,
        marginHorizontal: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },
    mealsContainer: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    mealContainer: {
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
    mealType: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    mealTime: {
        fontSize: 16,
        fontWeight: '500',
    },
    foodItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    foodItemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    foodItemDetails: {
        fontSize: 14,
    },
    emptyState: {
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        marginBottom: 10,
    },
    addMealButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        marginTop: 10,
    },
    addMealButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    summaryContainer: {
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 15,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 16,
    },
    rightActions: {
        flexDirection: 'row',
        width: 120,
        height: '100%',
    },
    rightAction: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
    },
    editAction: {
        backgroundColor: '#4A90E2',
    },
    deleteAction: {
        backgroundColor: '#FF3B30',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    summarySection: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    exerciseSection: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    exerciseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    exerciseText: {
        fontSize: 16,
    },
    progressContainer: {
        marginVertical: 8,
    },
    progressLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    progressValue: {
        fontSize: 16,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
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
        backgroundColor: '#2196F3',
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
    dateNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
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
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    dateButtonDisabled: {
        opacity: 0.5,
    },
    dateButtonText: {
        fontSize: 24,
        fontWeight: '500',
    },
    dateTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    calendarIcon: {
        marginLeft: 4,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    exerciseSummary: {
        fontSize: 16,
        marginTop: 5,
        lineHeight: 22,
    },
    noExercise: {
        fontSize: 16,
        fontStyle: 'italic',
        marginTop: 5,
    },
    completeButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    completeButton: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    completeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    noDataText: {
        textAlign: 'center',
        padding: 16,
        fontSize: 14,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        marginRight: 16,
    },
    rightAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: '100%',
    },
    editAction: {
        backgroundColor: '#4A90E2',
        marginRight: 8,
    },
    deleteAction: {
        backgroundColor: '#FF3B30',
    },
    actionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    mealItemContainer: {
        marginBottom: 8,
    },
    exerciseItemContainer: {
        marginBottom: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        shadowRadius: 3.84,
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
        fontWeight: '600',
    },
});

const LogScreen = ({ navigation, route }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [meals, setMeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterGoal, setWaterGoal] = useState(64); // Default to 64 oz (8 cups)
    const [exerciseSummary, setExerciseSummary] = useState('');
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);
    const waterUnit = 'oz';
    const WATER_INCREMENT = 8; // 8 oz increment
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
    const [exercise, setExercise] = useState('');
    const [editingExerciseId, setEditingExerciseId] = useState(null);
    const { theme } = useTheme();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        
        fetchUser();
    }, []);

    const fetchData = async () => {
        if (!userId) return;
        
        try {
            const dateString = selectedDate.toISOString().split('T')[0];
            
            // Fetch daily summary
            const { data: summaryData, error: summaryError } = await supabase
                .from('daily_summaries')
                .select('*')
                .eq('user_id', userId)
                .eq('date', dateString)
                .single();

            if (summaryError && summaryError.code !== 'PGRST116') {
                console.error('Error fetching daily summary:', summaryError);
                return;
            }

            // Update water intake
            if (summaryData?.water_intake !== undefined) {
                setWaterIntake(summaryData.water_intake);
            }

            // Update exercise summary
            if (summaryData?.exercise_summary) {
                setExerciseSummary(summaryData.exercise_summary);
            } else {
                setExerciseSummary('');
            }

            // Fetch meals
            const { data: mealsData, error: mealsError } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', userId)
                .eq('date', dateString);

            if (mealsError) {
                console.error('Error fetching meals:', mealsError);
                return;
            }

            setMeals(mealsData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId, selectedDate]);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (!userId) return;
                
                try {
                    setIsLoading(true);
                    const dateString = selectedDate.toISOString().split('T')[0];
                    
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
                        .eq('date', dateString)
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

                    // Fetch daily summary for the selected date
                    const { data: summaryData, error: summaryError } = await supabase
                        .from('daily_summaries')
                        .select('*')
                        .eq('user_id', userId)
                        .eq('date', dateString)
                        .single();

                    if (summaryError && summaryError.code !== 'PGRST116') {
                        console.error('Error fetching daily summary:', summaryError);
                    } else {
                        setWaterIntake(summaryData?.water_intake || 0);
                        setExerciseSummary(summaryData?.exercise_summary || '');
                    }

                    // Fetch daily food log for total calories
                    const { data: logData, error: logError } = await supabase
                        .from('daily_food_logs')
                        .select('total_protein_calories')
                        .eq('user_id', userId)
                        .eq('date', dateString)
                        .single();

                    if (logError && logError.code !== 'PGRST116') {
                        console.error('Error fetching daily log:', logError);
                    } else {
                        setCaloriesConsumed(logData?.total_protein_calories || 0);
                    }
                } catch (error) {
                    console.error('Error:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            
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
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        // Reset states for the new date
        setMeals([]);
        setWaterIntake(0);
        setExerciseSummary('');
        setCaloriesConsumed(0);
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
        // Navigate to edit meal screen with meal data
        navigation.navigate('AddFood', { meal });
    };

    const handleDeleteMeal = async (mealId) => {
        try {
            const dateString = selectedDate.toISOString().split('T')[0];

            // Delete the meal
            const { error: deleteError } = await supabase
                .from('meals')
                .delete()
                .eq('id', mealId);

            if (deleteError) throw deleteError;

            // Refresh data
            await fetchData();
        } catch (error) {
            console.error('Error deleting meal:', error);
            Alert.alert('Error', 'Failed to delete meal');
        }
    };

    const handleEditExercise = (exercise) => {
        setExercise(exercise.name);
        setEditingExerciseId(exercise.name);
        setIsExerciseModalVisible(true);
    };

    const handleDeleteExercise = async (exercise) => {
        try {
            const dateString = selectedDate.toISOString().split('T')[0];
            
            // Get current exercise summary
            const { data: summaryData, error: fetchError } = await supabase
                .from('daily_summaries')
                .select('*')
                .eq('user_id', userId)
                .eq('date', dateString)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching summary:', fetchError);
                Alert.alert('Error', 'Failed to delete exercise');
                return;
            }

            // Filter out the exercise to delete
            const currentExercises = summaryData?.exercise_summary
                ? summaryData.exercise_summary
                    .split(',')
                    .map(ex => ex.trim())
                    .filter(ex => ex !== '')
                : [];
            
            const updatedExercises = currentExercises.filter(ex => ex !== exercise.name);

            // Update the daily summary
            const { error: updateError } = await supabase
                .from('daily_summaries')
                .update({
                    exercise_summary: updatedExercises.join(', '),
                    water_intake: summaryData?.water_intake || 0,
                    exercise_calories: summaryData?.exercise_calories || 0,
                    total_protein_calories: summaryData?.total_protein_calories || 0,
                    fruit_servings: summaryData?.fruit_servings || 0,
                    vegetable_servings: summaryData?.vegetable_servings || 0,
                    miscellaneous_servings: summaryData?.miscellaneous_servings || 0,
                    updated_at: new Date().toISOString()
                })
                .eq('id', summaryData.id);

            if (updateError) {
                console.error('Error updating summary:', updateError);
                Alert.alert('Error', 'Failed to delete exercise');
                return;
            }

            // Update local state immediately
            setExerciseSummary(updatedExercises.join(', '));
            
            // Then refresh all data
            fetchData();
        } catch (error) {
            console.error('Error deleting exercise:', error);
            Alert.alert('Error', 'Failed to delete exercise');
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
                    food_items: meal.foodItems
                }}
                theme={theme}
            />
        );
    };

    const renderSummary = () => {
        if (!meals) return null;
        
        // Calculate progress percentages
        const proteinProgress = Math.min((caloriesConsumed / 2000) * 100, 100);
        const vegetableProgress = Math.min((meals.vegetable_servings / meals.vegetable_servings_goal) * 100, 100);
        const fruitProgress = Math.min((meals.fruit_servings / meals.fruit_servings_goal) * 100, 100);
        
        return (
            <View style={[styles.summarySection, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Summary</Text>
                
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
                                    backgroundColor: proteinProgress >= 100 ? theme.success : theme.primary
                                }
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
                            {meals.vegetable_servings} / {meals.vegetable_servings_goal}
                        </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { 
                                    width: `${vegetableProgress}%`,
                                    backgroundColor: vegetableProgress >= 100 ? theme.success : theme.primary
                                }
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
                            {meals.fruit_servings} / {meals.fruit_servings_goal}
                        </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { 
                                    width: `${fruitProgress}%`,
                                    backgroundColor: fruitProgress >= 100 ? theme.success : theme.primary
                                }
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
                                    }
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
                        <Text style={[styles.exerciseTitle, { color: theme.text }]}>Exercise</Text>
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
            
            const dateString = selectedDate.toISOString().split('T')[0];
            const { data: existingData, error: fetchError } = await supabase
                .from('daily_summaries')
                .select('id')
                .eq('user_id', userId)
                .eq('date', dateString)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching daily summary:', fetchError);
                setWaterIntake(waterIntake);
                return;
            }

            const { error } = await supabase
                .from('daily_summaries')
                .upsert({
                    ...(existingData?.id ? { id: existingData.id } : {}),
                    user_id: userId,
                    date: dateString,
                    water_intake: newWaterIntake,
                    exercise_summary: exerciseSummary || '' // Preserve exercise summary
                });

            if (error) {
                console.error('Error updating water intake:', error);
                setWaterIntake(waterIntake);
            }
        } catch (error) {
            console.error('Error updating water intake:', error);
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
            
            const dateString = selectedDate.toISOString().split('T')[0];
            const { data: existingData, error: fetchError } = await supabase
                .from('daily_summaries')
                .select('id')
                .eq('user_id', userId)
                .eq('date', dateString)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching daily summary:', fetchError);
                setWaterIntake(waterIntake);
                return;
            }

            const { error } = await supabase
                .from('daily_summaries')
                .upsert({
                    ...(existingData?.id ? { id: existingData.id } : {}),
                    user_id: userId,
                    date: dateString,
                    water_intake: newWaterIntake,
                    exercise_summary: exerciseSummary || '' // Preserve exercise summary
                });

            if (error) {
                console.error('Error updating water intake:', error);
                setWaterIntake(waterIntake);
            }
        } catch (error) {
            console.error('Error updating water intake:', error);
            setWaterIntake(waterIntake);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveExercise = async () => {
        if (!exercise.trim() || isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            const dateString = selectedDate.toISOString().split('T')[0];
            
            // First get the current exercise summary
            const { data: summaryData, error: fetchError } = await supabase
                .from('daily_summaries')
                .select('*')
                .eq('user_id', userId)
                .eq('date', dateString)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching daily summary:', fetchError);
                return;
            }

            let currentExercises = summaryData?.exercise_summary
                ? summaryData.exercise_summary.split(',').map(ex => ex.trim()).filter(ex => ex !== '')
                : [];

            if (editingExerciseId !== null) {
                // If editing, replace the old exercise
                const exerciseIndex = currentExercises.indexOf(editingExerciseId);
                if (exerciseIndex !== -1) {
                    currentExercises[exerciseIndex] = exercise.trim();
                }
            } else {
                // If adding new, append to the list
                currentExercises.push(exercise.trim());
            }

            // Update the daily summary
            const { error: updateError } = await supabase
                .from('daily_summaries')
                .upsert({
                    id: summaryData?.id,
                    user_id: userId,
                    date: dateString,
                    exercise_summary: currentExercises.join(', '),
                    water_intake: summaryData?.water_intake || 0
                });

            if (updateError) throw updateError;

            // Clear the input and close modal
            setExercise('');
            setEditingExerciseId(null);
            setIsExerciseModalVisible(false);
            
            // Refresh data
            await fetchData();
        } catch (error) {
            console.error('Error saving exercise:', error);
            Alert.alert('Error', 'Failed to save exercise');
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
                setExercise('');
                setEditingExerciseId(null);
                setIsExerciseModalVisible(false);
            }}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {editingExerciseId ? 'Edit Exercise' : 'Add Exercise'}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => {
                                setExercise('');
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
                            {isSubmitting ? 'Saving...' : (editingExerciseId ? 'Update Exercise' : 'Save Exercise')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {renderExerciseModal()}
            <View style={styles.container}>
                {/* Date Navigation */}
                <View style={[styles.dateNavigation, { backgroundColor: theme.cardBackground }]}>
                    <TouchableOpacity 
                        onPress={handlePreviousDay}
                        style={styles.dateButton}
                    >
                        <Text style={[styles.dateButtonText, { color: theme.text }]}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={showDatePicker}
                        style={styles.dateTouchable}
                    >
                        <Text style={[styles.dateText, { color: theme.text }]}>
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
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
                            selectedDate.toDateString() === new Date().toDateString() && styles.dateButtonDisabled
                        ]}
                        disabled={selectedDate.toDateString() === new Date().toDateString()}
                    >
                        <Text style={[
                            styles.dateButtonText,
                            { color: selectedDate.toDateString() === new Date().toDateString() ? theme.border : theme.text }
                        ]}>→</Text>
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
                    contentContainerStyle={[styles.contentContainer, { backgroundColor: theme.background }]}
                    showsVerticalScrollIndicator={false}
                >
                    {renderSummary()}

                    <View style={[styles.mealsContainer, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Meals</Text>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: theme.importantButton }]}
                                onPress={() => navigation.navigate('AddFood')}
                            >
                                <Text style={[styles.addButtonText, { color: theme.importantButtonText }]}>
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

                    <View style={[styles.exerciseContainer, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Exercise</Text>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: theme.importantButton }]}
                                onPress={() => setIsExerciseModalVisible(true)}
                            >
                                <Text style={[styles.addButtonText, { color: theme.importantButtonText }]}>
                                    + Add Exercise
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {exerciseSummary ? (
                            exerciseSummary.split(',').map((exercise, index) => (
                                <View key={index} style={styles.exerciseItemContainer}>
                                    <ExerciseItem
                                        exercise={{ id: index, name: exercise.trim() }}
                                        onEdit={handleEditExercise}
                                        onDelete={handleDeleteExercise}
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