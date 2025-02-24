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
        console.log('Mapping protein category:', category);
        return 'ketogenic'; // Always return ketogenic diet
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
            
            // Get user preferences
            const preferences = await this.getUserDietPreferences(userId);
            console.log('User preferences:', preferences);
            
            if (!preferences) {
                throw new Error('Could not get user preferences');
            }

            // Get allowed foods
            const allowedFoods = await this.getAllowedFoods();
            console.log('Fetched allowed foods:', allowedFoods);
            
            if (!allowedFoods.length) {
                console.error('No allowed foods found in database');
                return { recipes: [], articles: [] };
            }

            // Get protein foods to include in search
            const proteinFoods = allowedFoods
                .filter(food => food.category?.toLowerCase() === 'protein')
                .map(food => food.name.toLowerCase());
            
            // Get vegetable foods to include in search
            const vegetableFoods = allowedFoods
                .filter(food => food.category?.toLowerCase() === 'vegetable')
                .map(food => food.name.toLowerCase());

            console.log('Search foods:', { proteinFoods, vegetableFoods });

            // Create a query using some of our allowed foods
            const queryFoods = [...proteinFoods.slice(0, 2), ...vegetableFoods.slice(0, 2)];
            const query = queryFoods.length > 0 ? queryFoods.join(' OR ') : 'keto';
            console.log('Search query:', query);
            
            // Calculate per-meal calories (assuming 3 meals per day)
            const mealCalories = Math.round(preferences.target_calories / 3);
            console.log('Calculated meal calories:', mealCalories);

            // Try first with strict keto parameters
            let recipes = await spoonacularService.searchRecipes({
                maxCalories: mealCalories + 400,
                minProtein: Math.round(preferences.daily_protein_target / 5),
                diet: 'ketogenic',
                number: 100,
                query: query,
                maxCarbs: 15 // Allow slightly more carbs in search
            });
            console.log('Received recipes (strict search):', recipes.length);

            if (!recipes.length) {
                console.log('No recipes found with strict search, trying broader search');
                // Try again with more relaxed parameters
                recipes = await spoonacularService.searchRecipes({
                    maxCalories: mealCalories + 500,
                    number: 50,
                    query: 'keto protein',
                    maxCarbs: 20
                });
                console.log('Received recipes (broad search):', recipes.length);
                
                if (!recipes.length) {
                    console.log('No recipes found with broad search, trying final fallback');
                    // Final fallback with minimal restrictions
                    recipes = await spoonacularService.searchRecipes({
                        number: 50,
                        query: 'low carb high protein',
                        maxCarbs: 25
                    });
                    console.log('Received recipes (fallback search):', recipes.length);
                    
                    if (!recipes.length) {
                        console.log('No recipes found even with fallback search');
                        return { recipes: [], articles: [] };
                    }
                }
            }

            console.log('Starting to filter recipes...');
            
            // Filter recipes but be very lenient with the matching
            const allowedRecipes = recipes.filter(recipe => {
                console.log(`\nAnalyzing recipe: ${recipe.title}`);
                console.log(`Nutrition: ${JSON.stringify(recipe.nutrition)}`);
                
                // Check carbs first
                const carbsPerServing = recipe.nutrition?.carbs || 0;
                if (carbsPerServing > 20) { // More lenient carb limit
                    console.log(`Rejected: too many carbs (${carbsPerServing}g)`);
                    return false;
                }

                // Count allowed ingredients
                const allowedIngredientCount = recipe.ingredients.filter(ingredient => {
                    const allowed = this.isRecipeAllowed(recipe, allowedFoods);
                    console.log(`Ingredient ${ingredient.name}: ${allowed ? 'allowed' : 'not allowed'}`);
                    return allowed;
                }).length;
                
                // Calculate percentage of allowed ingredients
                const allowedPercentage = (allowedIngredientCount / recipe.ingredients.length) * 100;
                
                // More lenient requirements:
                // 1. At least 30% of ingredients are allowed, OR
                // 2. It has at least 2 allowed ingredients and is under carb limit
                const hasMinimumAllowed = allowedIngredientCount >= 2;
                const meetsPercentage = allowedPercentage >= 30;
                
                const isAllowed = meetsPercentage || (hasMinimumAllowed && carbsPerServing <= 20);
                
                console.log(`Recipe results:
                    - Carbs per serving: ${carbsPerServing}g
                    - Allowed ingredients: ${allowedIngredientCount}/${recipe.ingredients.length} (${allowedPercentage.toFixed(1)}%)
                    - Final decision: ${isAllowed ? 'ALLOWED' : 'REJECTED'}`
                );
                
                return isAllowed;
            });
            
            console.log(`Filtered ${recipes.length} recipes down to ${allowedRecipes.length} allowed recipes`);

            // Sort recipes by a combination of carbs (lower is better) and allowed ingredients (higher is better)
            const sortedRecipes = allowedRecipes.sort((a, b) => {
                const aCarbs = a.nutrition?.carbs || 0;
                const bCarbs = b.nutrition?.carbs || 0;
                const aCarbScore = Math.max(0, 1 - (aCarbs / 20)); // 0 to 1, where 1 is best (0 carbs)
                const bCarbScore = Math.max(0, 1 - (bCarbs / 20));
                
                const aAllowed = a.ingredients.filter(i => this.isRecipeAllowed(a, allowedFoods)).length;
                const bAllowed = b.ingredients.filter(i => this.isRecipeAllowed(b, allowedFoods)).length;
                const aAllowedScore = aAllowed / a.ingredients.length;
                const bAllowedScore = bAllowed / b.ingredients.length;
                
                // Weight carbs more heavily (70%) than ingredient matching (30%)
                const aScore = (aCarbScore * 0.7) + (aAllowedScore * 0.3);
                const bScore = (bCarbScore * 0.7) + (bAllowedScore * 0.3);
                
                return bScore - aScore;
            });

            // Take only the first 10 recipes
            const finalRecipes = sortedRecipes.slice(0, 10);
            console.log('Final recipes:', finalRecipes.map(r => ({
                title: r.title,
                carbs: r.nutrition?.carbs,
                allowedIngredients: r.ingredients.filter(i => this.isRecipeAllowed(r, allowedFoods)).length
            })));

            return {
                recipes: finalRecipes,
                articles: []
            };
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return { recipes: [], articles: [] };
        }
    }
};
