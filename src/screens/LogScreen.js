import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform, Modal, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../utils/supabase';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';


const LogScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
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

    useEffect(() => {
        const fetchLogData = async () => {
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
                        setLogData({ ...summaryData, meals: mealData });
                        setWaterIntake(summaryData.water_intake);
                    } else {
                        setLogData({
                            date: selectedDate, 
                            total_calories: 2004, 
                            total_protein: 0,
                            total_carbs: 0,
                            total_fat: 0,
                            water_intake: 0,
                            meals: mealData || [], 
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
        };

        fetchLogData();
    }, [selectedDate, navigation]); 

    const handleAddWater = async () => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            const newIntake = Math.round(waterIntake + ozToMl(8));
            
            // First try to update existing record
            const { data, error: updateError } = await supabase
                .from('daily_summaries')
                .update({ water_intake: newIntake })
                .match({ 
                    user_id: supabase.auth.user().id, 
                    date: selectedDate.toISOString().split('T')[0] 
                });

            if (updateError) {
                // If update fails (no existing record), insert new record
                const { error: insertError } = await supabase
                    .from('daily_summaries')
                    .insert({
                        user_id: supabase.auth.user().id,
                        date: selectedDate.toISOString().split('T')[0],
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
                .match({ 
                    user_id: supabase.auth.user().id, 
                    date: selectedDate.toISOString().split('T')[0] 
                });

            if (updateError) {
                // If update fails (no existing record), insert new record
                const { error: insertError } = await supabase
                    .from('daily_summaries')
                    .insert({
                        user_id: supabase.auth.user().id,
                        date: selectedDate.toISOString().split('T')[0],
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

    const handleEditMeal = (meal) => {
        setSelectedMeal(meal);
        setIsEditModalVisible(true);
    };

    const handleDeleteMeal = async (mealId) => {
        try {
            const { error } = await supabase
                .from('meal_entries')
                .delete()
                .match({ id: mealId });

            if (error) {
                console.error('Error deleting meal:', error);
                Alert.alert('Error', 'Failed to delete meal');
                return;
            }

            // Refresh the log data
            fetchLogData();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    const handleUpdateMeal = async (updatedMeal) => {
        try {
            const { error } = await supabase
                .from('meal_entries')
                .update({
                    name: updatedMeal.name,
                    calories: updatedMeal.calories,
                    protein: updatedMeal.protein,
                    carbs: updatedMeal.carbs,
                    fat: updatedMeal.fat,
                    type: updatedMeal.type
                })
                .match({ id: selectedMeal.id });

            if (error) {
                console.error('Error updating meal:', error);
                Alert.alert('Error', 'Failed to update meal');
                return;
            }

            setIsEditModalVisible(false);
            setSelectedMeal(null);
            // Refresh the log data
            fetchLogData();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

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

    // Transform meals data
    const transformedMeals = logData?.meals?.reduce((acc, meal) => {
        const mealType = meal.type;
        if (!acc[mealType]) {
            acc[mealType] = {
                type: mealType,
                totalCalories: 0,
                items: []
            };
        }
        
        meal.food_items.forEach(item => {
            acc[mealType].items.push({
                id: item.id,
                name: item.name,
                calories: item.calories || 0,
                protein: item.protein || 0,
                carbs: item.carbs || 0,
                fat: item.fat || 0,
                type: mealType
            });
            acc[mealType].totalCalories += item.calories || 0;
        });
        
        return acc;
    }, {}) || {};

    const mealsArray = Object.values(transformedMeals);
    const totalCaloriesConsumed = mealsArray.reduce((total, meal) => total + meal.totalCalories, 0);
    const remainingCalories = logData?.total_calories ? logData.total_calories - totalCaloriesConsumed : 2004 - totalCaloriesConsumed;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.dateHeader}>
                    <TouchableOpacity 
                        style={styles.dateArrow}
                        onPress={() => handleDateChange(-1)}
                    >
                        <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.dateContainer}
                        onPress={showDatePicker}
                    >
                        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                        {selectedDate.toDateString() === new Date().toDateString() && (
                            <Text style={styles.todayLabel}>Today</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.dateArrow}
                        onPress={() => handleDateChange(1)}
                    >
                        <Ionicons name="chevron-forward" size={24} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.caloriesSummary}>
                    <View style={styles.calorieCard}>
                        <Text style={styles.calorieLabel}>Daily Goal</Text>
                        <Text style={styles.calorieValue}>{logData?.total_calories || 2004}</Text>
                        <Text style={styles.calorieUnit}>cal</Text>
                    </View>
                    <View style={[styles.calorieCard, styles.middleCard]}>
                        <Text style={styles.calorieLabel}>Consumed</Text>
                        <Text style={styles.calorieValue}>{totalCaloriesConsumed}</Text>
                        <Text style={styles.calorieUnit}>cal</Text>
                    </View>
                    <View style={[styles.calorieCard, remainingCalories < 0 ? styles.calorieCardWarning : null]}>
                        <Text style={styles.calorieLabel}>Remaining</Text>
                        <Text style={[styles.calorieValue, remainingCalories < 0 ? styles.calorieValueWarning : null]}>
                            {remainingCalories}
                        </Text>
                        <Text style={[styles.calorieUnit, remainingCalories < 0 ? styles.calorieValueWarning : null]}>cal</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Meals</Text>
                    {mealsArray.length > 0 ?
                        (mealsArray.map((meal, index) => (
                            <View key={index} style={styles.mealSection}>
                                <View style={styles.mealHeader}>
                                    <Text style={styles.mealName}>{meal.type}</Text>
                                    <Text style={styles.suggestedCalories}>Total Calories: {meal.totalCalories}</Text>
                                </View>
                                {meal.items.length > 0 ? (
                                    meal.items.map((item, index) => (
                                        <GestureHandlerRootView key={item.id} style={{ flex: 1 }}>
                                            {renderMealEntry(item)}
                                        </GestureHandlerRootView>
                                    ))
                                ) : (
                                    <TouchableOpacity style={styles.addButton}>
                                        <Text style={styles.addButtonText}>ADD {meal.type.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))) :
                        (<View style={styles.mealSection}>
                            <View style={styles.mealHeader}>
                                <Text style={styles.mealName}>No Meals Logged</Text>
                            </View>
                        </View>)
                    }

                    <View style={styles.waterSection}>
                        <Text style={styles.waterLabel}>Water Intake</Text>
                        <Text style={styles.waterValue}>{mlToOz(waterIntake).toFixed(2)} oz</Text>
                        <Text style={styles.waterGoal}>Goal: {waterGoal} oz</Text>
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