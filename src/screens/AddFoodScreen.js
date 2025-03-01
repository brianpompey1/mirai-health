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
import { localToUTC, getStartOfDay, getEndOfDay, getLocalDateString } from '../utils/timezone';

const AddFoodScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { editMode, mealId, mealType: initialMealType, mealTime: initialMealTime, foodItems: initialFoodItems, selectedDate } = params;
  
  const [mealType, setMealType] = useState(initialMealType || '');
  const [mealTime, setMealTime] = useState(initialMealTime || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState('');
  const [foodItems, setFoodItems] = useState(initialFoodItems || []);
  const { theme } = useTheme();

  const formatSelectedDate = (dateStr) => {
    return getLocalDateString(new Date(dateStr));
  };

  useEffect(() => {
    // Set navigation title based on mode
    navigation.setOptions({
      title: editMode ? 'Edit Meal' : 'Add Food',
    });

    // If editing, set the initial food items
    if (editMode && initialFoodItems) {
      setFoodItems(initialFoodItems);
    }
  }, [editMode, navigation, initialFoodItems]);

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
    const { data: { user } } = await supabase.auth.getUser();
    
    const date = selectedDate ? formatSelectedDate(selectedDate) : getLocalDateString();
    
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
      Alert.alert('Warning', `Adding this will exceed your daily limit of 2 vegetable servings. Current: ${currentVegServings}, Adding: ${servingsToAdd}`);
      return true; // Return true to indicate the warning was shown
    }
    if (category === 'fruit' && currentFruitServings + servingsToAdd > 1) {
      Alert.alert('Warning', `Adding this will exceed your daily limit of 1 fruit serving. Current: ${currentFruitServings}, Adding: ${servingsToAdd}`);
      return true; // Return true to indicate the warning was shown
    }
    return false; // Return false to indicate no limits were exceeded
  };

  const handleAddFoodItem = async () => {
    if (!selectedFood || !servings || !mealType) {
      Alert.alert('Error', 'Please select a food item, specify servings, and choose a meal type');
      return;
    }

    try {
      // Check limits but don't prevent adding
      await checkDailyLimits(selectedFood.category, parseFloat(servings));
      
      const newFoodItem = {
        id: selectedFood.id,
        name: selectedFood.name,
        servings: parseFloat(servings),
        category: selectedFood.category
      };

      setFoodItems([...foodItems, newFoodItem]);
      setSelectedFood(null);
      setSearchTerm('');
      setServings('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error checking daily limits:', error);
      Alert.alert('Error', 'Failed to check daily limits');
    }
  };

  const handleSave = async () => {
    if (!mealType) {
      Alert.alert('Error', 'Please enter a meal type');
      return;
    }

    if (foodItems.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get current date/time in user's timezone
      const now = new Date();
      
      // If we're editing and have an initial time, use that; otherwise use current time
      let timeString;
      if (editMode && initialMealTime) {
        timeString = initialMealTime; // PostgreSQL time format is already correct
      } else {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeString = `${hours}:${minutes}:${seconds}`;
      }

      // Get today's date in local timezone
      const today = getLocalDateString(new Date());

      const mealData = {
        type: mealType,
        time: timeString,
        user_id: user.id,
        date: selectedDate || today // selectedDate is already in the correct format
      };

      let mealId = route.params?.mealId;
      
      if (editMode && mealId) {
        // Update existing meal
        const { error: updateError } = await supabase
          .from('meals')
          .update(mealData)
          .eq('id', mealId);
          
        if (updateError) throw updateError;

        // Delete existing food items
        const { error: deleteError } = await supabase
          .from('food_items')
          .delete()
          .eq('meal_id', mealId);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new meal
        const { data: newMeal, error: insertError } = await supabase
          .from('meals')
          .insert([mealData])
          .select()
          .single();
          
        if (insertError) throw insertError;
        mealId = newMeal.id;
      }

      // Insert new food items
      const foodItemsData = foodItems.map(item => ({
        meal_id: mealId,
        name: item.name,
        servings: item.servings
      }));

      const { error: foodItemsError } = await supabase
        .from('food_items')
        .insert(foodItemsData);

      if (foodItemsError) throw foodItemsError;

      // Fetch updated meals to refresh the log
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate ? getLocalDateString(new Date(selectedDate)) : getLocalDateString());

      if (error) throw error;

      Alert.alert(
        'Success', 
        `Meal ${editMode ? 'updated' : 'added'} successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal');
    }
  };

  const handleRemoveFood = (index) => {
    const newFoodItems = [...foodItems];
    newFoodItems.splice(index, 1);
    setFoodItems(newFoodItems);
  };

  // Render food items list
  const renderFoodItems = () => (
    <View style={styles.foodItemsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Foods</Text>
      {foodItems.map((item, index) => (
        <View key={index} style={styles.foodItemRow}>
          <Text style={[styles.foodItemText, { color: theme.text }]}>
            {item.name} - {item.servings} serving(s)
          </Text>
          <TouchableOpacity onPress={() => handleRemoveFood(index)}>
            <Ionicons name="close-circle" size={24} color={theme.danger} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerSection, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>{editMode ? 'Edit Meal' : 'Add Food'}</Text>

        <View style={[styles.buttonContainer, { backgroundColor: theme.background }]}>
          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mealTypeButton, 
                mealType === type && styles.selectedMealType, 
                { backgroundColor: theme.background }
              ]}
              onPress={() => setMealType(type)}
            >
              <Text style={[
                styles.buttonText, 
                mealType === type && styles.selectedMealText, 
                { color: theme.text, fontSize: 10 }
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.searchSection, { backgroundColor: theme.background }]}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.text }]}
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
                  onPress={handleAddFoodItem}
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
                  renderItem={({ item, index }) => (
                    <View style={[styles.foodItem, { backgroundColor: theme.background }]}>
                      <Text style={[styles.foodItemText, { color: theme.text }]}>
                        {item.name} - {item.servings} servings
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveFood(index)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="close-circle-outline" size={24} color={theme.danger} />
                      </TouchableOpacity>
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
                    onPress={handleSave}
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
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  foodItemText: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    padding: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodItemsContainer: {
    marginTop: 20,
    padding: 10,
  },
  foodItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default AddFoodScreen;