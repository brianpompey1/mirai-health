import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';

const AddFoodScreen = ({ navigation, route }) => {
    const [mealType, setMealType] = useState('');
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [loading, setLoading] = useState(false);
    const [foodItems, setFoodItems] = useState([]); // Array to store added food items

    const { closeModal } = route.params || {}; // Get function

    useEffect(() => {
        if (closeModal) {
            closeModal();
        }
    }, []);

    const handleAddFood = () => {
        // Basic validation
        if (!foodName || !calories) {
            Alert.alert('Error', 'Please enter food name and calories.');
            return;
        }
        if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
            Alert.alert('Error', 'Calories, protein, carbs, and fat must be numbers.');
            return;
        }

        const newFoodItem = {
            name: foodName,
            calories: parseInt(calories, 10), // Ensure integer
            protein: protein ? parseInt(protein, 10) : 0, // Default to 0 if empty
            carbs: carbs ? parseInt(carbs, 10) : 0,
            fat: fat ? parseInt(fat, 10) : 0,
        };

        setFoodItems([...foodItems, newFoodItem]);

        // Clear input fields
        setFoodName('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
    };

    const handleSaveMeal = async () => {
        setLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                Alert.alert('Error', "You must be logged in")
                navigation.navigate('Auth');
                return
            }

            if (!mealType) {
                Alert.alert("Error", "Please select a meal type")
                return;
            }
            if (foodItems.length === 0) {
                Alert.alert('Error', 'Please add at least one food item.');
                return;
            }
            const date = new Date().toISOString().split("T")[0];
            // 1. Create the Meal
            const { data: mealData, error: mealError } = await supabase
                .from('meals')
                .insert([{ user_id: user.id, date: date, time: new Date().toLocaleTimeString(), type: mealType }])
                .select();
            //.single(); // Get the created meal's ID

            if (mealError) throw mealError;
            const mealId = mealData[0].id;

            // 2. Create the Food Items (using the mealId)
            const foodItemsToInsert = foodItems.map((item) => ({
                meal_id: mealId,
                name: item.name,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat
            }));

            const { error: foodItemError } = await supabase
                .from('food_items')
                .insert(foodItemsToInsert)
                .select();

            if (foodItemError) throw foodItemError;

            // 3. Update Daily Summary (calories, macros)
            // First, get existing summary (if any)
            const { data: summaryData, error: summaryError } = await supabase
                .from('daily_summaries')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', new Date().toISOString().split('T')[0])
                .single(); // Important: Use single() here, as it is possible to be null

            if (summaryError && summaryError.code !== 'PGRST116') { // Ignore the no-data error
                throw summaryError;
            }

            let currentCalories = 0;
            let currentProtein = 0;
            let currentCarbs = 0;
            let currentFat = 0;

            if (summaryData) {
                currentCalories = summaryData.total_calories;
                currentProtein = summaryData.total_protein;
                currentCarbs = summaryData.total_carbs;
                currentFat = summaryData.total_fat;
            }

            const newTotalCalories = currentCalories + foodItems.reduce((sum, item) => sum + item.calories, 0);
            const newTotalProtein = currentProtein + foodItems.reduce((sum, item) => sum + item.protein, 0);
            const newTotalCarbs = currentCarbs + foodItems.reduce((sum, item) => sum + item.carbs, 0);
            const newTotalFat = currentFat + foodItems.reduce((sum, item) => sum + item.fat, 0);

            const { error: updateError } = await supabase
                .from('daily_summaries')
                .upsert(
                    {
                        user_id: user.id,
                        date: new Date().toISOString().split('T')[0],
                        total_calories: newTotalCalories,
                        total_protein: newTotalProtein,
                        total_carbs: newTotalCarbs,
                        total_fat: newTotalFat,
                        // water_intake:  <-- Don't update water here
                    },
                    { onConflict: 'user_id, date' }
                ).select();
            if (updateError) throw updateError;

            Alert.alert('Success', 'Meal saved successfully!');
            navigation.goBack(); // Navigate back after saving

        } catch (error) {
            console.error('Error saving meal:', error);
            Alert.alert('Error', 'Failed to save meal.');
        } finally {
            setLoading(false);
        }
    };

    const renderFoodItem = ({ item, index }) => (
        <View key={index} style={styles.foodItem}>
            <Text>{item.name} - {item.calories} cal</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Food</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.mealTypeButton, mealType === 'breakfast' && styles.selectedMealType]}
                    onPress={() => setMealType('breakfast')}>
                    <Text style={styles.buttonText}>Breakfast</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mealTypeButton, mealType === 'lunch' && styles.selectedMealType]}
                    onPress={() => setMealType('lunch')}>
                    <Text style={styles.buttonText}>Lunch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mealTypeButton, mealType === 'dinner' && styles.selectedMealType]}
                    onPress={() => setMealType('dinner')}>
                    <Text style={styles.buttonText}>Dinner</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mealTypeButton, mealType === 'snack' && styles.selectedMealType]}
                    onPress={() => setMealType('snack')}>
                    <Text style={styles.buttonText}>Snack</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Food Name"
                    value={foodName}
                    onChangeText={setFoodName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Calories"
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Protein (g)"
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Carbs (g)"
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Fat (g)"
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddFood}
                >
                    <Text style={styles.addButtonText}>Add Food Item</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={foodItems}
                renderItem={renderFoodItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.foodList}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No food items added yet</Text>
                )}
            />

            <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSaveMeal}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>
                    {loading ? 'Saving...' : 'Save Meal'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    mealTypeButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        width: '48%',
        marginBottom: 10,
        alignItems: 'center',
    },
    selectedMealType: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodList: {
        flex: 1,
        marginTop: 20,
    },
    foodItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    }
});

export default AddFoodScreen;