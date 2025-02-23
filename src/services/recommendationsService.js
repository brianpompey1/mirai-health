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
        switch (category) {
            case 'Very Lean':
                return 'low-fat';
            case 'Lean':
                return 'balanced';
            case 'Medium Fat':
                return 'mediterranean';
            case 'Protein Alternative':
                return 'vegetarian';
            default:
                return 'balanced';
        }
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
            
            // Calculate per-meal calories (assuming 3 meals per day)
            const mealCalories = Math.round(preferences.target_calories / 3);
            console.log('Calculated meal calories:', mealCalories);

            // Get recipe recommendations
            const recipes = await spoonacularService.searchRecipes({
                maxCalories: mealCalories,
                minProtein: Math.round(preferences.daily_protein_target / 3), // protein per meal
                diet: this.mapProteinCategoryToDiet(preferences.preferred_protein_category),
                number: 10
            });
            console.log('Received recipes:', recipes.length);

            return {
                recipes,
                articles: [] // We can add article recommendations later if needed
            };
        } catch (error) {
            console.error('Error getting recommendations:', error);
            throw error;
        }
    }
};
