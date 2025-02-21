import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native'; // Removed StatusBar import
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { supabase } from '../utils/supabase';

const LogScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [logData, setLogData] = useState(null);
    const [loading, setLoading] = useState(true);


    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setSelectedDate(date);
        hideDatePicker();
    };

    const formatDate = (date) => {
        return date.toDateString(); // e.g., "Mon Feb 17 2024"
    }

    useEffect(() => {
        const fetchLogData = async () => {
            setLoading(true);
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                navigation.navigate('Auth') 
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('daily_summaries')
                    .select('*')
                    .eq('user_id', user.id) // Replace with actual user ID
                    .eq('date', selectedDate.toISOString().split('T')[0]) // Use selectedDate
                // .single(); // We expect only one summary per day

                if (error) {
                    console.error('Error fetching log data:', error);
                    Alert.alert('Error', 'Failed to fetch log data.');
                } else {
                    const summaryData = data && data.length > 0 ? data[0] : null;
                    //Fetch meals
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
                        .eq('date', selectedDate.toISOString().split('T')[0])
                        .order('time', { ascending: true })
                    if (mealError) {
                        console.error("Error fetching meals:", mealError)
                        Alert.alert("Error", "Failed to fetch meals")
                        return;
                    }
                    if (summaryData) {
                        setLogData({ ...summaryData, meals: mealData });
                    } else {
                        //Handle case where no data exists for date.
                        setLogData({
                            date: selectedDate, // Keep track of the date
                            total_calories: 2004, // Your default calorie budget
                            total_protein: 0,
                            total_carbs: 0,
                            total_fat: 0,
                            water_intake: 0,
                            meals: mealData || [], // Use mealData if available, otherwise empty array
                        });
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
    }, [selectedDate, navigation]); // Fetch data when selectedDate changes

    const subtractDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    }

    const addDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    }


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

    // Transform meal data for display (similar to DashboardScreen)
    const transformedMeals = logData.meals.reduce((acc, meal) => {
        const mealType = meal.type;
        const mealItems = meal.food_items.map((item) => ({
            name: item.name,
            calories: item.calories,
        }));

        if (!acc[mealType]) {
            acc[mealType] = {
                name: mealType.charAt(0).toUpperCase() + mealType.slice(1), // Capitalize
                items: mealItems,
            };
        } else {
            acc[mealType].items = [...acc[mealType].items, ...mealItems];
        }
        return acc;
    }, {});

    const mealsArray = Object.values(transformedMeals);
    const caloriesRemaining = logData.total_calories ? logData.total_calories : 2004;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={subtractDay}>
                        <Ionicons name="chevron-back-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={showDatePicker}>
                        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addDay}>
                        <Ionicons name="chevron-forward-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Removed the nested ScrollView */}
                {/* Calorie Summary */}
                <View style={styles.calorieSummary}>
                    <Text style={styles.calorieLabel}>CALORIES</Text>
                    <View style={styles.calorieRow}>
                        <Text style={styles.calorieValue}>{logData.total_calories || 2004}</Text>
                        <Text style={styles.calorieLabelSmall}>BUDGET</Text>
                        <Text style={styles.calorieValue}>{logData.total_calories - caloriesRemaining}</Text>
                        <Text style={styles.calorieLabelSmall}>FOOD</Text>
                        <Text style={styles.calorieValue}>0</Text>
                        <Text style={styles.calorieLabelSmall}>EXERCISE</Text>
                        <Text style={styles.calorieValue}>{logData.total_calories - caloriesRemaining}</Text>
                        <Text style={styles.calorieLabelSmall}>NET</Text>
                        <Text style={[styles.calorieValue, { color: caloriesRemaining > 0 ? 'green' : 'red' }]}>
                            {caloriesRemaining}
                        </Text>
                        <Text style={styles.calorieLabelSmall}>UNDER</Text>
                    </View>
                </View>

                {/* Meal Sections */}
                {mealsArray.length > 0 ?
                    (Object.entries(transformedMeals).map(([mealKey, meal]) => (
                        <View key={mealKey} style={styles.mealSection}>
                            <View style={styles.mealHeader}>
                                <Text style={styles.mealName}>{meal.name}</Text>
                                {/* <Text style={styles.suggestedCalories}>{meal.suggestedCalories} calories suggested</Text> */}
                            </View>
                            {meal.items.length > 0 ? (
                                meal.items.map((item, index) => (
                                    <View key={index} style={styles.foodItem}>
                                        <Text>{item.name}</Text>
                                        <Text>{item.calories} cal</Text>
                                    </View>
                                ))
                            ) : (
                                <TouchableOpacity style={styles.addButton}>
                                    <Text style={styles.addButtonText}>ADD {meal.name.toUpperCase()}</Text>
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

                {/* Water Intake */}
                <View style={styles.waterSection}>
                    <Text style={styles.waterLabel}>Water Intake</Text>
                    <Text style={styles.waterValue}>{logData.water_intake} ml</Text>
                </View>
                <View style={{ height: 30 }}></View>
                {/* End of ScrollView content */}

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
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
      flex: 1, // Important: Make the ScrollView fill the SafeAreaView
      // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // REMOVE THIS
    },
    loadingContainer:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: 'lightgray',
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContainer: { // This style is no longer used
        padding: 16,
    },
    calorieSummary: {
        marginBottom: 20,
        alignItems: 'center',
    },
    calorieLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray',
    },
    calorieRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    calorieValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    calorieLabelSmall: {
        fontSize: 12,
        color: 'gray',
        width: '25%',
        textAlign: 'center',
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
        backgroundColor: '#007AFF', // Blue color
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
});

export default LogScreen;