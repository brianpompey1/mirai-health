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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
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
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    editAction: {
        backgroundColor: 'blue',
    },
    deleteAction: {
        backgroundColor: 'red',
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
});

const LogScreen = ({ navigation, route }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [logData, setLogData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterGoal, setWaterGoal] = useState(64); // Default to 64 oz (8 cups)
    const [exerciseSummary, setExerciseSummary] = useState('');
    const waterUnit = 'oz';
    const WATER_INCREMENT = 8; // 8 oz increment
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
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

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (!userId) return;

                try {
                    setIsLoading(true);

                    const dateString = selectedDate.toISOString().split('T')[0];

                    // Fetch user's protein calorie target
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('daily_protein_calorie_target')
                        .eq('id', userId)
                        .single();

                    if (userError) {
                        console.error('Error fetching user data:', userError);
                        return;
                    }

                    // Fetch daily summary for water and exercise
                    const { data: summaryData, error: summaryError } = await supabase
                        .from('daily_summaries')
                        .select('water_intake, exercise_summary')
                        .eq('user_id', userId)
                        .eq('date', dateString)
                        .single();

                    if (summaryError && summaryError.code !== 'PGRST116') {
                        console.error('Error fetching summary data:', summaryError);
                    }

                    // Set water intake and exercise summary from summary data if it exists
                    if (summaryData) {
                        setWaterIntake(summaryData.water_intake || 0);
                        setExerciseSummary(summaryData.exercise_summary || '');
                    } else {
                        setWaterIntake(0);
                        setExerciseSummary('');
                    }

                    // Fetch daily food log
                    const { data: logData, error: logError } = await supabase
                        .from('daily_food_logs')
                        .select('*')
                        .eq('user_id', userId)
                        .eq('date', dateString)
                        .single();

                    if (logError && logError.code !== 'PGRST116') {
                        console.error('Error fetching daily log:', logError);
                        return;
                    }

                    // Fetch meals with their associated food items
                    const { data: meals, error: mealsError } = await supabase
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
                        return;
                    }

                    // Initialize log with default values if it doesn't exist
                    const log = logData || {
                        id: null,
                        user_id: userId,
                        date: dateString,
                        total_protein_calories: 0,
                        vegetable_servings: 0,
                        fruit_servings: 0
                    };

                    // Add water, exercise data, and goals
                    setLogData({ 
                        ...log, 
                        meals: meals || [],
                        water_intake: summaryData?.water_intake || 0,
                        exercise_summary: summaryData?.exercise_summary || '',
                        protein_calorie_allowance: userData?.daily_protein_calorie_target || 2000,
                        vegetable_servings_goal: 2,  // Fixed value per diet plan specs
                        fruit_servings_goal: 1       // Fixed value per diet plan specs
                    });

                } catch (error) {
                    console.error('Error in fetchLogData:', error);
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
        setLogData(null);
        setWaterIntake(0);
        setExerciseSummary('');
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

    const handleEditMeal = (foodItem) => {
        setSelectedMeal(foodItem);
        setIsEditModalVisible(true);
    };

    const handleDeleteMeal = useCallback(async (foodItemId) => {
        try {
            // Delete the food item
            const { error: foodItemError } = await supabase
                .from('food_items')
                .delete()
                .match({ id: foodItemId });

            if (foodItemError) {
                console.error('Error deleting food item:', foodItemError);
                Alert.alert('Error', 'Failed to delete food item');
                return;
            }

            // Refresh the log data
            await fetchData();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    }, []);

    const handleUpdateMeal = useCallback(async (updatedMeal) => {
        try {
            // Update the food item
            const { error: foodItemError } = await supabase
                .from('food_items')
                .update({
                    name: updatedMeal.name,
                    calories: updatedMeal.calories,
                    protein: updatedMeal.protein,
                    carbs: updatedMeal.carbs,
                    fat: updatedMeal.fat
                })
                .match({ id: updatedMeal.id });

            if (foodItemError) {
                console.error('Error updating food item:', foodItemError);
                Alert.alert('Error', 'Failed to update food item');
                return;
            }

            setIsEditModalVisible(false);
            setSelectedMeal(null);
            // Refresh the log data
            await fetchData();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    }, []);

    const handleAddWater = async () => {
        if (isSubmitting || !userId) return;
        
        try {
            setIsSubmitting(true);
            const newWaterIntake = waterIntake + WATER_INCREMENT;
            setWaterIntake(newWaterIntake);
            
            const today = new Date().toISOString().split('T')[0];
            const { data: existingData, error: fetchError } = await supabase
                .from('daily_summaries')
                .select('id')
                .eq('user_id', userId)
                .eq('date', today)
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
                    date: today,
                    water_intake: newWaterIntake
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
            
            const today = new Date().toISOString().split('T')[0];
            const { data: existingData, error: fetchError } = await supabase
                .from('daily_summaries')
                .select('id')
                .eq('user_id', userId)
                .eq('date', today)
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
                    date: today,
                    water_intake: newWaterIntake
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

    const renderRightActions = (meal, dragX) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.rightActions}>
                <TouchableOpacity
                    style={[styles.rightAction, styles.editAction]}
                    onPress={() => handleEditMeal(meal)}
                >
                    <Animated.Text
                        style={[styles.actionText, { transform: [{ scale }] }, theme.text]}
                    >
                        Edit
                    </Animated.Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.rightAction, styles.deleteAction]}
                    onPress={() => 
                        Alert.alert(
                            'Delete Meal',
                            'Are you sure you want to delete this meal?',
                            [
                                {text: 'Cancel', style: 'cancel'},
                                {text: 'Delete', onPress: () => handleDeleteMeal(meal.id), style: 'destructive'},
                            ]
                        )
                    }
                >
                    <Animated.Text
                        style={[styles.actionText, { transform: [{ scale }] }, theme.text]}
                    >
                        Delete
                    </Animated.Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderMealItem = (meal) => {
        return (
            <View key={meal.id} style={[styles.mealContainer, { backgroundColor: theme.background }]}>
                <View style={styles.mealHeader}>
                    <Text style={[styles.mealType, { color: theme.text }]}>
                        {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                    </Text>
                    <Text style={[styles.mealTime, { color: theme.text }]}>
                        {new Date(`2000-01-01T${meal.time}`).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                        })}
                    </Text>
                </View>
                {meal.food_items && meal.food_items.map((item) => {
                    return (
                        <View key={item.id} style={styles.foodItemContainer}>
                            <Text style={[styles.foodItemName, { color: theme.text }]}>
                                {item.name}
                            </Text>
                            <Text style={[styles.foodItemDetails, { color: theme.text }]}>
                                {item.servings} servings
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderSummary = () => {
        if (!logData) return null;
        
        // Calculate progress percentages
        const proteinProgress = Math.min((logData.total_protein_calories / logData.protein_calorie_allowance) * 100, 100);
        const vegetableProgress = Math.min((logData.vegetable_servings / logData.vegetable_servings_goal) * 100, 100);
        const fruitProgress = Math.min((logData.fruit_servings / logData.fruit_servings_goal) * 100, 100);
        
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
                            {logData.total_protein_calories} / {logData.protein_calorie_allowance}
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
                            {logData.vegetable_servings} / {logData.vegetable_servings_goal}
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
                            {logData.fruit_servings} / {logData.fruit_servings_goal}
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
                {logData.exercise_summary && (
                    <View style={styles.exerciseSection}>
                        <Text style={[styles.exerciseTitle, { color: theme.text }]}>Exercise</Text>
                        <Text style={[styles.exerciseText, { color: theme.text }]}>
                            {logData.exercise_summary}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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

                <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                    {renderSummary()}

                    <View style={[styles.mealsContainer, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Meals</Text>
                        {logData?.meals && logData.meals.length > 0 ? (
                            logData.meals.map(meal => renderMealItem(meal))
                        ) : (
                            <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
                                <Text style={[styles.emptyStateText, { color: theme.text }]}>No meals logged for this day</Text>
                                <TouchableOpacity 
                                    style={styles.addMealButton}
                                    onPress={() => navigation.navigate('AddFood')}
                                >
                                    <Text style={styles.addMealButtonText}>Add Meal</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default LogScreen;