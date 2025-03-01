import { supabase } from '../utils/supabase';
import { spoonacularService } from './spoonacularService';

export const recommendationsService = {
    // Get user's diet preferences
    async getUserDietPreferences(userId) {
        try {
            console.log('Fetching diet preferences for user:', userId);
            
            // First, try to get user's preferences
            const { data: preferences, error } = await supabase
                .from('user_diet_plans')
                .select('*')
                .eq('user_id', userId)
                .single();

            // If table doesn't exist or other error, use default preferences
            if (error) {
                console.log('Using default preferences due to error:', error.message);
                return {
                    user_id: userId,
                    target_calories: 2000,
                    preferred_protein_category: 'Lean',
                    daily_protein_target: 100,
                    daily_vegetable_servings: 2,
                    daily_fruit_servings: 1,
                };
            }

            // If no preferences found, create default ones
            if (!preferences) {
                const defaultPreferences = {
                    user_id: userId,
                    target_calories: 2000,
                    preferred_protein_category: 'Lean',
                    daily_protein_target: 100,
                    daily_vegetable_servings: 2,
                    daily_fruit_servings: 1,
                    created_at: new Date().toISOString(),
                };

                // Try to create the table and insert default preferences
                try {
                    const { data, error: insertError } = await supabase
                        .from('user_diet_plans')
                        .insert(defaultPreferences)
                        .select()
                        .single();

                    if (insertError) {
                        console.log('Could not save default preferences:', insertError.message);
                        return defaultPreferences;
                    }

                    return data;
                } catch (insertError) {
                    console.log('Using default preferences without saving:', insertError.message);
                    return defaultPreferences;
                }
            }

            return preferences;
        } catch (error) {
            console.error('Error in getUserDietPreferences:', error);
            // Return default preferences as fallback
            return {
                user_id: userId,
                target_calories: 2000,
                preferred_protein_category: 'Lean',
                daily_protein_target: 100,
                daily_vegetable_servings: 2,
                daily_fruit_servings: 1,
            };
        }
    },

    // Convert our protein categories to Spoonacular diet types
    mapProteinCategoryToDiet(category) {
        switch (category?.toLowerCase()) {
            case 'very lean':
                return 'low-fat';
            case 'lean':
                return 'high-protein';
            case 'medium fat':
                return 'ketogenic';
            case 'protein alternative':
                return 'vegetarian';
            default:
                return 'balanced';
        }
    },

    // Get allowed foods for a user
    async getAllowedFoods() {
        try {
            // First check if the table exists and has data
            const { data: tableCheck, error: tableError } = await supabase
                .from('allowed_foods')
                .select('count')
                .limit(1);

            console.log('Table check result:', { tableCheck, tableError });

            if (tableError) {
                console.error('Error checking allowed_foods table:', tableError);
                // Try the food_items table instead
                const { data: foodItems, error: foodError } = await supabase
                    .from('food_items')
                    .select('name, category')
                    .not('category', 'eq', 'Beverages'); // Exclude beverages as per diet plan

                if (foodError) {
                    console.error('Error fetching from food_items:', foodError);
                    return [];
                }

                console.log('Using food_items as allowed foods:', foodItems);
                return foodItems || [];
            }

            const { data: allowedFoods, error } = await supabase
                .from('allowed_foods')
                .select('*');

            if (error) {
                console.error('Error fetching allowed foods:', error);
                return [];
            }

            console.log('Fetched from allowed_foods:', allowedFoods);
            return allowedFoods || [];
        } catch (error) {
            console.error('Error in getAllowedFoods:', error);
            return [];
        }
    },

    // Check if a recipe only uses allowed ingredients
    isRecipeAllowed(recipe, allowedFoods) {
        if (!recipe.ingredients || !allowedFoods) {
            console.log('Missing ingredients or allowedFoods');
            return false;
        }

        // List of carbs to avoid
        const forbiddenCarbs = [
            'bread', 'pasta', 'rice', 'flour', 'sugar', 'wheat', 'corn', 'potato',
            'cereal', 'oat', 'grain', 'tortilla', 'chip', 'cracker', 'cookie',
            'cake', 'pastry', 'noodle', 'starch', 'syrup', 'honey', 'molasses',
            'quinoa', 'couscous', 'barley', 'millet', 'rye'
        ];

        // Common keto-friendly ingredients
        const ketoFriendly = [
            // Proteins
            'meat', 'fish', 'chicken', 'turkey', 'beef', 'pork', 'lamb', 'egg',
            'salmon', 'tuna', 'shrimp', 'bacon', 'sausage',
            
            // Fats
            'oil', 'butter', 'cream', 'cheese', 'avocado', 'coconut',
            'olive oil', 'ghee', 'lard',
            
            // Low-carb vegetables
            'spinach', 'kale', 'lettuce', 'cabbage', 'broccoli', 'cauliflower',
            'asparagus', 'zucchini', 'cucumber', 'celery', 'mushroom',
            
            // Seasonings and herbs (all allowed)
            'salt', 'pepper', 'garlic', 'oregano', 'thyme', 'basil', 'parsley',
            'rosemary', 'sage', 'bay leaf', 'cilantro', 'mint', 'dill',
            'cumin', 'paprika', 'coriander', 'turmeric', 'ginger', 'mustard',
            'vinegar', 'lemon', 'lime', 'herb', 'spice', 'seasoning'
        ];

        // Check recipe macros first
        const carbsPerServing = recipe.nutrition?.carbs || 0;
        const maxAllowedCarbs = 10; // Max 10g carbs per serving for keto

        if (carbsPerServing > maxAllowedCarbs) {
            console.log(`Recipe "${recipe.title}" rejected: too many carbs (${carbsPerServing}g per serving)`);
            return false;
        }

        // Helper function to check if an ingredient is allowed
        const isIngredientAllowed = (ingredient) => {
            const ingredientName = ingredient.name.toLowerCase();
            
            // Check for forbidden carbs
            if (forbiddenCarbs.some(carb => ingredientName.includes(carb))) {
                console.log(`Ingredient rejected (carb): ${ingredientName}`);
                return false;
            }

            // Allow if it's a keto-friendly ingredient
            if (ketoFriendly.some(keto => ingredientName.includes(keto))) {
                console.log(`Ingredient allowed (keto-friendly): ${ingredientName}`);
                return true;
            }

            // Allow if it's in our allowed foods list
            for (const food of allowedFoods) {
                if (food.category?.toLowerCase() === 'protein' || 
                    food.category?.toLowerCase() === 'vegetable') {
                    if (ingredientName.includes(food.name.toLowerCase())) {
                        console.log(`Ingredient allowed (from allowed foods): ${ingredientName}`);
                        return true;
                    }
                }
            }

            // For unknown ingredients, check if they're small quantities
            const smallAmount = ingredient.amount <= 2;
            if (smallAmount) {
                console.log(`Ingredient allowed (small amount): ${ingredientName}`);
                return true;
            }

            console.log(`Ingredient not explicitly allowed: ${ingredientName}`);
            return false;
        };

        // Check each ingredient
        const ingredients = recipe.ingredients;
        const allowedIngredients = ingredients.filter(isIngredientAllowed);
        const allowedRatio = allowedIngredients.length / ingredients.length;
        
        // Allow recipe if:
        // 1. Under carb limit AND
        // 2. At least 70% of ingredients are allowed
        const isAllowed = allowedRatio >= 0.7;
        
        console.log(`Recipe "${recipe.title}":
            - Carbs per serving: ${carbsPerServing}g
            - Allowed ingredients: ${Math.round(allowedRatio * 100)}%
            - Final decision: ${isAllowed ? 'ALLOWED' : 'REJECTED'}`
        );
        
        return isAllowed;
    },

    // Get personalized recommendations
    async getPersonalizedRecommendations(userId) {
        try {
            console.log('Getting recommendations for user:', userId);
            
            // Get user's diet preferences
            const preferences = await this.getUserDietPreferences(userId);
            console.log('User preferences:', preferences);

            // Get list of allowed foods
            const allowedFoods = await this.getAllowedFoods();
            console.log('Number of allowed foods:', allowedFoods?.length || 0);

            // Calculate daily targets
            const targetCaloriesPerMeal = Math.round(preferences.target_calories / 3);
            const diet = this.mapProteinCategoryToDiet(preferences.preferred_protein_category);

            console.log('Searching recipes with params:', {
                maxCalories: targetCaloriesPerMeal,
                minProtein: Math.round(preferences.daily_protein_target / 3),
                diet,
                maxCarbs: 50 // Reasonable limit for all diet types
            });

            // Get recipes from Spoonacular
            const recipes = await spoonacularService.searchRecipes({
                maxCalories: targetCaloriesPerMeal,
                minProtein: Math.round(preferences.daily_protein_target / 3),
                diet,
                maxCarbs: 50,
                number: 10
            });

            console.log('Found recipes:', recipes?.length || 0);

            // Filter recipes to only include those with allowed ingredients
            const filteredRecipes = recipes.filter(recipe => 
                this.isRecipeAllowed(recipe, allowedFoods)
            );

            console.log('Filtered recipes:', filteredRecipes?.length || 0);

            return {
                recipes: filteredRecipes,
                preferences
            };
        } catch (error) {
            console.error('Error getting personalized recommendations:', error);
            throw error;
        }
    }
};
