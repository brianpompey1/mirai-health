import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform, Modal, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../utils/supabase';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

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

    const fetchLogData = useCallback(async () => {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            navigation.navigate('Auth');
            return;
        }
        try {
            // Format date as YYYY-MM-DD for database query
            const dateString = selectedDate.toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('daily_summaries')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', dateString);

            if (error) {
                console.error('Error fetching log data:', error);
                Alert.alert('Error', 'Failed to fetch log data.');
            } else {
                const summaryData = data && data.length > 0 ? data[0] : null;
                const { data: mealData, error: mealError } = await supabase
                    .from('meals')
                    .select(`
                        id,
                        time,
                        type,
                        total_calories,
                        food_items (
                            id,
                            name,
                            calories,
                            protein,
                            carbs,
                            fat
                        )
                    `)
                    .eq('user_id', user.id)
                    .eq('date', dateString)
                    .order('time', { ascending: true });

                if (mealError) {
                    console.error("Error fetching meals:", mealError);
                    Alert.alert("Error", "Failed to fetch meals");
                    return;
                }
                if (summaryData) {
                    setLogData({ ...summaryData, meals: mealData || [] });
                    setWaterIntake(summaryData.water_intake || 0);
                } else {
                    // Reset everything for a new day
                    setLogData({
                        date: selectedDate, 
                        total_calories: 0,
                        total_protein: 0,
                        total_carbs: 0,
                        total_fat: 0,
                        water_intake: 0,
                        meals: [],
                    });
                    setWaterIntake(0);
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, navigation]);

    // Update selectedDate to current date when screen is focused
    useFocusEffect(
        useCallback(() => {
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Set time to midnight for comparison
            const current = new Date(selectedDate);
            current.setHours(0, 0, 0, 0);

            if (now.getTime() !== current.getTime()) {
                setSelectedDate(now);
            }
        }, [])
    );

    // Add useEffect to handle refresh parameter
    useEffect(() => {
        if (route.params?.refresh) {
            fetchLogData();
            // Clear the refresh parameter
            navigation.setParams({ refresh: undefined });
        }
    }, [route.params?.refresh, fetchLogData]);

    // Fetch data when selectedDate changes
    useEffect(() => {
        fetchLogData();
    }, [fetchLogData]);

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
                        style={[styles.actionText, { transform: [{ scale }] }, {color: theme.text}]}
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
                        style={[styles.actionText, { transform: [{ scale }] }, {color: theme.text}]}
                    >
                        Delete
                    </Animated.Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderMealEntry = (meal) => (
        <Swipeable
            renderRightActions={(progress, dragX) => renderRightActions(meal, dragX)}
            rightThreshold={40}
            key={meal.id}
        >
            <View style={styles.mealEntry}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.nutritionInfo}>
                    <Text style={styles.nutritionText}>Calories: {meal.calories}</Text>
                    <Text style={styles.nutritionText}>Protein: {meal.protein}g</Text>
                    <Text style={styles.nutritionText}>Carbs: {meal.carbs}g</Text>
                    <Text style={styles.nutritionText}>Fat: {meal.fat}g</Text>
                </View>
            </View>
        </Swipeable>
    );

    const EditMealModal = () => (
        <Modal
            visible={isEditModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsEditModalVisible(false)}
        >
            <View style={[styles.modalContainer, {backgroundColor: theme.background}]}>
                <View style={[styles.modalContent, {backgroundColor: theme.background}]}>
                    <Text style={[styles.modalTitle, {color: theme.text}]}>Edit Meal</Text>
                    {selectedMeal && (
                        <>
                            <TextInput
                                style={[styles.input, {backgroundColor: theme.background, color: theme.text}]}
                                value={selectedMeal.name}
                                onChangeText={(text) => setSelectedMeal({...selectedMeal, name: text})}
                                placeholder="Meal Name"
                            />
                            <TextInput
                                style={[styles.input, {backgroundColor: theme.background, color: theme.text}]}
                                value={String(selectedMeal.calories)}
                                onChangeText={(text) => setSelectedMeal({...selectedMeal, calories: Number(text)})}
                                keyboardType="numeric"
                                placeholder="Calories"
                            />
                            <TextInput
                                style={[styles.input, {backgroundColor: theme.background, color: theme.text}]}
                                value={String(selectedMeal.protein)}
                                onChangeText={(text) => setSelectedMeal({...selectedMeal, protein: Number(text)})}
                                keyboardType="numeric"
                                placeholder="Protein (g)"
                            />
                            <TextInput
                                style={[styles.input, {backgroundColor: theme.background, color: theme.text}]}
                                value={String(selectedMeal.carbs)}
                                onChangeText={(text) => setSelectedMeal({...selectedMeal, carbs: Number(text)})}
                                keyboardType="numeric"
                                placeholder="Carbs (g)"
                            />
                            <TextInput
                                style={[styles.input, {backgroundColor: theme.background, color: theme.text}]}
                                value={String(selectedMeal.fat)}
                                onChangeText={(text) => setSelectedMeal({...selectedMeal, fat: Number(text)})}
                                keyboardType="numeric"
                                placeholder="Fat (g)"
                            />
                            <View style={[styles.modalButtons, {backgroundColor: theme.background}]}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setIsEditModalVisible(false)}
                                >
                                    <Text style={[styles.buttonText, {color: theme.text}]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.button, styles.saveButton]}
                                    onPress={() => handleUpdateMeal(selectedMeal)}
                                >
                                    <Text style={[styles.buttonText, {color: theme.text}]}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    const CustomDatePicker = () => {
        const minDate = new Date(2024, 0, 1);
        const maxDate = new Date(2025, 11, 31);

        // Format date as YYYY-MM-DD for the calendar
        const formatDateForCalendar = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return (
            <Modal
                visible={isDatePickerVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                            <Text style={styles.datePickerTitle}>Select Date</Text>
                            <TouchableOpacity onPress={hideDatePicker}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Calendar
                            current={formatDateForCalendar(selectedDate)}
                            minDate={formatDateForCalendar(minDate)}
                            maxDate={formatDateForCalendar(maxDate)}
                            onDayPress={handleConfirm}
                            markedDates={{
                                [formatDateForCalendar(selectedDate)]: {
                                    selected: true,
                                    selectedColor: '#007AFF',
                                },
                            }}
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#333',
                                selectedDayBackgroundColor: '#007AFF',
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: '#007AFF',
                                dayTextColor: '#333',
                                textDisabledColor: '#d9e1e8',
                                dotColor: '#007AFF',
                                selectedDotColor: '#ffffff',
                                arrowColor: '#007AFF',
                                monthTextColor: '#333',
                                textDayFontSize: 16,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 14,
                            }}
                        />
                    </View>
                </View>
            </Modal>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!logData) {
        return (
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <Text>No data available for this date.</Text>
            </View>
          </SafeAreaView>
        );
    }

    // Transform meals data into the same format as DashboardScreen
    const transformedMeals = logData?.meals?.reduce((acc, meal) => {
        const mealType = meal.type || 'Other';
        const mealItems = meal.food_items?.map((item) => ({
            id: item.id,
            name: item.name,
            calories: item.calories || 0,
            protein: item.protein || 0,
            carbs: item.carbs || 0,
            fat: item.fat || 0
        })) || [];

        if (!acc[mealType]) {
            acc[mealType] = {
                type: mealType,
                name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
                items: mealItems,
                totalCalories: mealItems.reduce((sum, item) => sum + item.calories, 0)
            };
        } else {
            acc[mealType].items = [...acc[mealType].items, ...mealItems];
            acc[mealType].totalCalories = acc[mealType].items.reduce((sum, item) => sum + item.calories, 0);
        }
        
        return acc;
    }, {}) || {};

    const mealsArray = Object.values(transformedMeals);

    // Calculate totals the same way as DashboardScreen
    let totalCaloriesConsumed = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealsArray.forEach((meal) => {
        totalCaloriesConsumed += meal.totalCalories;
        totalProtein += meal.items.reduce((sum, item) => sum + item.protein, 0);
        totalCarbs += meal.items.reduce((sum, item) => sum + item.carbs, 0);
        totalFat += meal.items.reduce((sum, item) => sum + item.fat, 0);
    });

    // Get the daily calorie goal from the user's profile or use default
    const dailyCalorieGoal = 2004; // This should be fetched from user settings
    const remainingCalories = dailyCalorieGoal - totalCaloriesConsumed;

    return (
      <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.background}]}>
            <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
                <View style={[styles.dateHeader, {backgroundColor: theme.background}]}>
                    <TouchableOpacity 
                        style={[styles.dateArrow, {backgroundColor: theme.background}]}
                        onPress={() => handleDateChange(-1)}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.dateContainer, {backgroundColor: theme.background}]}
                        onPress={showDatePicker}
                    >
                        <Text style={[styles.dateText, {color: theme.text}]}>{formatDate(selectedDate)}</Text>
                        {selectedDate.toDateString() === new Date().toDateString() && (
                            <Text style={[styles.todayLabel, {color: theme.text}]}>Today</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.dateArrow, {backgroundColor: theme.background}]}
                        onPress={() => handleDateChange(1)}
                    >
                        <Ionicons name="chevron-forward" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.caloriesSummary, {backgroundColor: theme.cardBackground}]}>
                    <View style={[styles.calorieCard, {backgroundColor: theme.cardBackground}]}>
                        <Text style={[styles.calorieLabel, {color: theme.text}]}>Daily Goal</Text>
                        <Text style={[styles.calorieValue, {color: theme.text}]}>{dailyCalorieGoal}</Text>
                        <Text style={[styles.calorieUnit, {color: theme.text}]}>cal</Text>
                    </View>
                    <View style={[styles.calorieCard, styles.middleCard, {backgroundColor: theme.cardBackground}]}>
                        <Text style={[styles.calorieLabel, {color: theme.text}]}>Consumed</Text>
                        <Text style={[styles.calorieValue, {color: theme.text}]}>{totalCaloriesConsumed}</Text>
                        <Text style={[styles.calorieUnit, {color: theme.text}]}>cal</Text>
                    </View>
                    <View style={[styles.calorieCard, {backgroundColor: theme.cardBackground}]}>
                        <Text style={[styles.calorieLabel, {color: theme.text}]}>Remaining</Text>
                        <Text style={[styles.calorieValue, remainingCalories < 0 ? styles.calorieValueWarning : null, {color: theme.text}]}>{remainingCalories}</Text>
                        <Text style={[styles.calorieUnit, remainingCalories < 0 ? styles.calorieValueWarning : null, {color: theme.text}]}>cal</Text>
                    </View>
                </View>

                <View style={[styles.section, {backgroundColor: theme.cardBackground}]}>
                    <Text style={[styles.sectionTitle, {color: theme.text}]}>Meals</Text>
                    {mealsArray.length > 0 ?
                        (mealsArray.map((meal, index) => (
                            <View key={index} style={[styles.mealSection, {backgroundColor: theme.cardBackground}]}>
                                <View style={[styles.mealHeader, {backgroundColor: theme.cardBackground}]}>
                                    <Text style={[styles.mealName, {color: theme.text}]}>{meal.type}</Text>
                                    <Text style={[styles.suggestedCalories, {color: theme.text}]}>Total Calories: {meal.totalCalories}</Text>
                                </View>
                                {meal.items.length > 0 ? (
                                    meal.items.map((item, index) => (
                                        <GestureHandlerRootView key={item.id} style={{ flex: 1 }}>
                                            {renderMealEntry(item)}
                                        </GestureHandlerRootView>
                                    ))
                                ) : (
                                    <TouchableOpacity style={[styles.addButton, {backgroundColor: theme.cardBackground}]} onPress={() => handleAddMeal(meal.type)}>
                                        <Text style={[styles.addButtonText, {color: theme.text}]}>ADD {meal.type.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))) :
                        (<View style={[styles.mealSection, {backgroundColor: theme.cardBackground}]}>
                            <View style={[styles.mealHeader, {backgroundColor: theme.cardBackground}]}>
                                <Text style={[styles.mealName, {color: theme.text}]}>No Meals Logged</Text>
                            </View>
                        </View>)
                    }

                    <View style={[styles.waterSection, {backgroundColor: theme.cardBackground}]}>
                        <Text style={[styles.waterLabel, {color: theme.text}]}>Water Intake</Text>
                        <Text style={[styles.waterValue, {color: theme.text}]}>{mlToOz(waterIntake).toFixed(2)} oz</Text>
                        <Text style={[styles.waterGoal, {color: theme.text}]}>Goal: {waterGoal} oz</Text>
                        {/* <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity onPress={handleRemoveWater}>
                                <Text style={{fontSize: 18, color: 'blue'}}> - </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddWater}>
                                <Text style={{fontSize: 18, color: 'blue'}}> + </Text>
                            </TouchableOpacity>
                        </View> */}
                    </View>
                    <View style={{ height: 30 }}></View>

                    <CustomDatePicker />
                    <EditMealModal />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    container: {
      flex: 1, 
      // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
    },
    loadingContainer:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'

    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: 'white',
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
    dateContainer: {
        flex: 1,
        alignItems: 'center',
        maxWidth: '60%',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    todayLabel: {
        fontSize: 12,
        color: '#007AFF',
        marginTop: 4,
    },
    dateArrow: {
        padding: 10,
        width: 44,
        alignItems: 'center',
    },
    caloriesSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'white',
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
    calorieCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    middleCard: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#eee',
        marginHorizontal: 15,
    },
    calorieCardWarning: {
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
    },
    calorieLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    calorieValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    calorieUnit: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    calorieValueWarning: {
        color: '#E53E3E',
    },
    section: {
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 15,
        padding: 15,
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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
        backgroundColor: '#007AFF', 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
    waterGoal: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        width: '45%',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    mealEntry: {
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    mealName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    nutritionInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    nutritionText: {
        fontSize: 14,
        color: '#666',
        marginRight: 12,
        marginBottom: 4,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
    },
    rightAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: '100%',
    },
    editAction: {
        backgroundColor: '#007AFF',
    },
    deleteAction: {
        backgroundColor: '#FF3B30',
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
        padding: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    datePickerContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    datePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
});

export default LogScreen;