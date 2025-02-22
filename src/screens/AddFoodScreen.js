import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import { useTheme } from '../contexts/ThemeContext';

const AddFoodScreen = ({ navigation, route }) => {
  const [mealType, setMealType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const { theme } = useTheme();

  const { closeModal } = route.params || {};

  useEffect(() => {
    if(closeModal) {
      closeModal();
    }
  }, []);

  // Search foods from allowed_foods table
  const searchFoods = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('allowed_foods')
        .select('*')
        .ilike('name', `%${term}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Error', 'Failed to search foods');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchFoods, 300), []);

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSearchResults([]);
    setSearchTerm(food.name);
  };

  const checkDailyLimits = async (category, servingsToAdd) => {
    const date = new Date().toISOString().split('T')[0];
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('daily_food_logs')
      .select('vegetable_servings, fruit_servings')
      .eq('user_id', user.id)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    const currentVegServings = data?.vegetable_servings || 0;
    const currentFruitServings = data?.fruit_servings || 0;

    if (category === 'vegetable' && currentVegServings + servingsToAdd > 2) {
      throw new Error('You have reached your daily limit of 2 vegetable servings');
    }
    if (category === 'fruit' && currentFruitServings + servingsToAdd > 1) {
      throw new Error('You have reached your daily limit of 1 fruit serving');
    }
  };

  const handleAddFood = async () => {
    if (!selectedFood) {
      Alert.alert('Error', 'Please select a food item.');
      return;
    }
    if (!servings || isNaN(servings) || parseFloat(servings) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of servings.');
      return;
    }

    const servingsNum = parseFloat(servings);
    
    try {
      // Check serving limits for vegetables and fruits
      if (selectedFood.category === 'vegetable' || selectedFood.category === 'fruit') {
        await checkDailyLimits(selectedFood.category, servingsNum);
      }

      // Calculate calories only for proteins and miscellaneous items
      const calories = ['protein', 'miscellaneous'].includes(selectedFood.category)
        ? selectedFood.calories_per_serving * servingsNum
        : 0;

      const newFoodItem = {
        name: selectedFood.name,
        servings: servingsNum,
        allowed_food: selectedFood
      };

      setFoodItems([...foodItems, newFoodItem]);
      setSelectedFood(null);
      setServings('');
      setSearchTerm('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSaveMeal = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', "You must be logged in");
        navigation.navigate('Auth');
        return;
      }

      if (!mealType) {
        Alert.alert("Error", "Please select a meal type");
        return;
      }
      if (foodItems.length === 0) {
        Alert.alert('Error', 'Please add at least one food item.');
        return;
      }

      const date = new Date().toISOString().split('T')[0];

      // 1. Create or update daily_food_logs
      const { data: logData, error: logError } = await supabase
        .from('daily_food_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (logError && logError.code !== 'PGRST116') throw logError;

      const vegServings = foodItems
        .filter(item => item.allowed_food.category === 'vegetable')
        .reduce((sum, item) => sum + item.servings, 0);
      
      const fruitServings = foodItems
        .filter(item => item.allowed_food.category === 'fruit')
        .reduce((sum, item) => sum + item.servings, 0);
      
      const proteinCalories = foodItems
        .filter(item => item.allowed_food.category === 'protein')
        .reduce((sum, item) => sum + item.allowed_food.calories_per_serving * item.servings, 0);

      const miscCalories = foodItems
        .filter(item => item.allowed_food.category === 'miscellaneous')
        .reduce((sum, item) => sum + item.allowed_food.calories_per_serving * item.servings, 0);

      if (logData) {
        // Update existing log
        const { error: updateError } = await supabase
          .from('daily_food_logs')
          .update({
            vegetable_servings: logData.vegetable_servings + vegServings,
            fruit_servings: logData.fruit_servings + fruitServings,
            total_protein_calories: logData.total_protein_calories + proteinCalories + miscCalories
          })
          .eq('id', logData.id);

        if (updateError) throw updateError;
      } else {
        // Create new log
        const { error: insertError } = await supabase
          .from('daily_food_logs')
          .insert([{
            user_id: user.id,
            date: date,
            vegetable_servings: vegServings,
            fruit_servings: fruitServings,
            total_protein_calories: proteinCalories + miscCalories
          }]);

        if (insertError) throw insertError;
      }

      // 2. Create the Meal
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert([{
          user_id: user.id,
          date: date,
          type: mealType,
          time: timeStr // Format time as HH:MM:SS
        }])
        .select();

      if (mealError) throw mealError;

      // 3. Create the Food Items
      const foodItemsToInsert = foodItems.map(item => ({
        meal_id: mealData[0].id,
        name: item.name,
        servings: item.servings
      }));

      const { error: foodItemError } = await supabase
        .from('food_items')
        .insert(foodItemsToInsert);

      if (foodItemError) throw foodItemError;

      Alert.alert('Success', 'Meal added successfully!');
      navigation.navigate('Log', { refresh: true });
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerSection, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Add Food</Text>

        <View style={[styles.buttonContainer, { backgroundColor: theme.background }]}>
          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.mealTypeButton, mealType === type && styles.selectedMealType, { backgroundColor: theme.background }]}
              onPress={() => setMealType(type)}
            >
              <Text style={[styles.buttonText, mealType === type && styles.selectedMealText, { color: theme.text }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.searchSection, { backgroundColor: theme.background }]}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.background }]}
            placeholder="Search for a food..."
            value={searchTerm}
            onChangeText={handleSearchChange}
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.background }]}
            onPress={() => debouncedSearch(searchTerm)}
            disabled={loading}
          >
            <Ionicons name="search" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={[styles.loader, { backgroundColor: theme.background }]} />
        ) : (
          <>
            {selectedFood && (
              <View style={[styles.selectedFoodContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.selectedFoodName, { color: theme.text }]}>{selectedFood.name}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background }]}
                  placeholder="Servings"
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.background }]}
                  onPress={handleAddFood}
                  disabled={loading}
                >
                  <Text style={[styles.addButtonText, { color: theme.text }]}>Add to Meal</Text>
                </TouchableOpacity>
              </View>
            )}

            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.searchResultItem, { backgroundColor: theme.background }]} 
                    onPress={() => handleSelectFood(item)}
                  >
                    <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.foodInfo, { color: theme.text }]}>
                      {item.category || ''}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.text }]}>No foods found.</Text>
                }
              />
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Added Foods</Text>
                <FlatList
                  data={foodItems}
                  renderItem={({ item }) => (
                    <View style={[styles.foodItem, { backgroundColor: theme.background }]}>
                      <Text style={[styles.foodItemText, { color: theme.text }]}>{item.name} - {item.servings} servings</Text>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.text }]}>No food items added yet.</Text>
                  }
                />
                {foodItems.length > 0 && (
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.background }]}
                    onPress={handleSaveMeal}
                    disabled={loading}
                  >
                    <Text style={[styles.saveButtonText, { color: theme.text }]}>
                      {loading ? 'Saving...' : 'Save Meal'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'sans-serif-medium',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mealTypeButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1, // Equal space
    marginHorizontal: 5, // Space between buttons
    alignItems: 'center'
  },
  selectedMealType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  selectedMealText: {
    color: 'white'
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
  },
  saveButton: {
    backgroundColor: '#27ae60', // Green
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
  },
  searchResultItem: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium'
  },
  foodInfo: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: 'gray'
  },
  selectedFoodContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  selectedFoodName: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10
  },
  foodItemText: {
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AddFoodScreen;