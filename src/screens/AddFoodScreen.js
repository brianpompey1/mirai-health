import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
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
import debounce from 'lodash.debounce'; // Install lodash.debounce:  npx expo install lodash.debounce

const API_KEY = 'NvuWQkWdvBXXyCf4C51INMrpBJc3OpLqYk5QUI50'; // Replace with your actual API key
const API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=';

const AddFoodScreen = ({ navigation, route }) => {
  const [mealType, setMealType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [foodItems, setFoodItems] = useState([]);

  const { closeModal } = route.params || {};

    useEffect(() => {
        if(closeModal) {
            closeModal();
        }
    }, [])

    const handleSelectFood = (food) => {
    // Find the nutrient data for calories (per 100g)
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;

        if (food.foodNutrients && food.foodNutrients.length > 0) {
            for (let nutrient of food.foodNutrients) {
              if (nutrient.nutrientName === "Energy" && nutrient.unitName === "KCAL") {
                calories = nutrient.value || 0;
              } else if (nutrient.nutrientName === "Protein") {
                  protein = nutrient.value || 0
              } else if(nutrient.nutrientName === "Carbohydrate, by difference") {
                carbs = nutrient.value || 0;
              } else if(nutrient.nutrientName === "Total lipid (fat)") {
                fat = nutrient.value || 0
              }
            }
        }

        setSelectedFood({
            fdcId: food.fdcId,
            name: food.description,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat
        });
      setSearchResults([]); // Clear results after selection
  };
  const handleAddFood = () => {
    if (!selectedFood) {
      Alert.alert('Error', 'Please select a food item.');
      return;
    }
    if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }
    const quantityNum = parseFloat(quantity);

    // Add the selected food item to the foodItems array
    const newFoodItem = {
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * quantityNum), // Calculate based on quantity
      protein:  Math.round(selectedFood.protein * quantityNum),
      carbs:  Math.round(selectedFood.carbs * quantityNum),
      fat: Math.round(selectedFood.fat * quantityNum),
    };

    setFoodItems([...foodItems, newFoodItem]);
     setSelectedFood(null); // Clear selected food
    setQuantity('');       // Clear quantity
    setSearchTerm('');
  };

  const handleSaveMeal = async() => {
     setLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                Alert.alert('Error', "You must be logged in")
                navigation.navigate('Auth');
                return
            }

            if(!mealType) {
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
                .insert([{
                    user_id: user.id,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().split(' ')[0], // Corrected line
                    type: mealType
                }])
                .select();


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

            if(summaryData) {
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
  }

  // Data filtering
    const filterFoodData = (data) => {
        if (!data || !data.foods) {
          return [];
        }

        const seen = new Set(); //To remove any duplicates
        const filteredResults = [];

        for (const food of data.foods) {
             if (food.description && food.description.length <= 100 && (food.dataType === "SR Legacy" || food.dataType === "Foundation") && !seen.has(food.description)) { //Could also add branded
                filteredResults.push(food);
                seen.add(food.description);
            }
        }
        return filteredResults;
    }

  // Debounced search function.
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 3) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      try {
        const url = `${API_URL}${API_KEY}&query=${encodeURIComponent(searchTerm)}&dataType=Foundation,SR%20Legacy&pageSize=20`;
        console.log('Attempting to fetch from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('Response not OK:', {
            status: response.status,
            statusText: response.statusText
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response received:', { 
          totalHits: data.totalHits,
          foodsCount: data.foods?.length 
        });
        
        const filteredData = filterFoodData(data);
        setSearchResults(filteredData);
      } catch (error) {
        console.error('Search error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        Alert.alert('Error', `Failed to search for food: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, 300), // 300ms delay
    []
  );

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]); // Call whenever searchTerm changes

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Add Food</Text>

        <View style={styles.buttonContainer}>
          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.mealTypeButton, mealType === type && styles.selectedMealType]}
              onPress={() => setMealType(type)}
            >
              <Text style={[styles.buttonText, mealType === type && styles.selectedMealText]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a food..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => debouncedSearch(searchTerm)}
            disabled={loading}
          >
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <>
            {selectedFood && (
              <View style={styles.selectedFoodContainer}>
                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                <View style={styles.macroRow}>
                  <Text style={styles.selectedFoodInfo}>Calories: {selectedFood.calories}</Text>
                  <Text style={styles.selectedFoodInfo}>Protein: {selectedFood.protein}g</Text>
                </View>
                <View style={styles.macroRow}>
                  <Text style={styles.selectedFoodInfo}>Carbs: {selectedFood.carbs}g</Text>
                  <Text style={styles.selectedFoodInfo}>Fat: {selectedFood.fat}g</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Quantity (e.g., 1 cup, 100g, 2)"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddFood}
                  disabled={loading}
                >
                  <Text style={styles.addButtonText}>Add to Meal</Text>
                </TouchableOpacity>
              </View>
            )}

            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.searchResultItem} 
                    onPress={() => handleSelectFood(item)}
                  >
                    <Text style={styles.foodName}>{item.description}</Text>
                    <Text style={styles.foodInfo}>
                      {item.foodCategory || ''}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.fdcId.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No foods found.</Text>
                }
              />
            ) : (
              <>
                <Text style={styles.sectionTitle}>Added Foods</Text>
                <FlatList
                  data={foodItems}
                  renderItem={({ item }) => (
                    <View style={styles.foodItem}>
                      <Text style={styles.foodItemText}>{item.name} - {item.calories} cal</Text>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No food items added yet.</Text>
                  }
                />
                {foodItems.length > 0 && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveMeal}
                    disabled={loading}
                  >
                    <Text style={styles.saveButtonText}>
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
  selectedFoodInfo: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    marginRight: 10
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
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