import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform, Modal, TextInput, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../utils/supabase';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

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
    }
});

const LogScreen = ({ navigation, route }) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set time to midnight
        return now;
    });
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [logData, setLogData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [waterIntake, setWaterIntake] = useState(0); // Store in ml internally
    const [waterGoal, setWaterGoal] = useState(64); // Default to 64 oz (8 cups)
    const [waterUnit, setWaterUnit] = useState('oz'); // Default to oz
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const { theme } = useTheme();

    const fetchLogData = async () => {
        try {
            setLoading(true);

            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error('Auth error:', authError);
                navigation.navigate('Auth');
                return;
            }

            const dateString = selectedDate.toISOString().split('T')[0];
            const { data: existingLog, error: logError } = await supabase
                .from('daily_food_logs')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', dateString)
                .single();

            if (logError && logError.code !== 'PGRST116') {
                console.error('Error fetching log:', logError);
                return;
            }

            let log = existingLog;
            if (!log) {
                const { data: newLog, error: createError } = await supabase
                    .from('daily_food_logs')
                    .insert([
                        {
                            user_id: user.id,
                            date: dateString,
                            vegetable_servings: 0,
                            fruit_servings: 0,
                            total_protein_calories: 0
                        }
                    ])
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating log:', createError);
                    return;
                }
                log = newLog;
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
                .eq('user_id', user.id)
                .eq('date', dateString)
                .order('time', { ascending: true });

            if (mealsError) {
                console.error('Error fetching meals:', mealsError);
                return;
            }

            setLogData({ ...log, meals: meals || [] });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update data when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchLogData();
        }, [selectedDate])
    );

    // Also fetch when route.params.refresh changes
    useEffect(() => {
        if (route.params?.refresh) {
            fetchLogData();
            // Reset the refresh param
            navigation.setParams({ refresh: false });
        }
    }, [route.params?.refresh, fetchLogData]);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        // Create date from the selected date string (YYYY-MM-DD)
        const [year, month, day] = date.dateString.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day); // month is 0-based
        setSelectedDate(selectedDate);
        hideDatePicker();
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleDateChange = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
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
            await fetchLogData();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    }, [fetchLogData]);

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
            await fetchLogData();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    }, [fetchLogData]);

    const ozToMl = (oz) => oz * 29.5735;
    const mlToOz = (ml) => ml / 29.5735;

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
        
        return (
            <View style={[styles.summaryContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>Daily Summary</Text>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        Vegetable Servings: {logData.vegetable_servings}/2
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        Fruit Servings: {logData.fruit_servings}/1
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        Total Protein Calories: {logData.total_protein_calories}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        Water Intake: {waterIntake} oz
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                    <TouchableOpacity 
                        style={[styles.dateButton, { backgroundColor: theme.cardBackground }]}
                        onPress={() => setDatePickerVisibility(true)}
                    >
                        <Text style={[styles.dateText, { color: theme.text }]}>
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                        <Ionicons name="calendar" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

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
        </SafeAreaView>
    );
};

export default LogScreen;