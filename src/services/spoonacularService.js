import { SPOONACULAR_CONFIG } from '../config/api';

class SpoonacularService {
    constructor() {
        this.baseUrl = SPOONACULAR_CONFIG.BASE_URL;
        this.apiKey = SPOONACULAR_CONFIG.API_KEY;
        console.log('SpoonacularService initialized with API key:', this.apiKey ? 'Present' : 'Missing');
    }

    async searchRecipes({
        maxCalories,
        minProtein = 15,
        diet,
        number = 10,
        offset = 0,
        query = '',
        intolerances = '',
    }) {
        try {
            console.log('Searching recipes with params:', { maxCalories, minProtein, diet, number });
            
            const url = new URL(this.baseUrl + SPOONACULAR_CONFIG.ENDPOINTS.RECIPE_SEARCH);
            const params = {
                apiKey: this.apiKey,
                maxCalories,
                minProtein,
                diet,
                number,
                offset,
                query,
                intolerances,
                addRecipeNutrition: true,
                fillIngredients: true,
                instructionsRequired: true,
            };

            url.search = new URLSearchParams(params).toString();
            console.log('Making request to:', url.toString().replace(this.apiKey, 'API_KEY'));

            const response = await fetch(url.toString());
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Spoonacular API error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            console.log('Received', data.results?.length || 0, 'recipes from Spoonacular');

            return data.results.map(recipe => this.transformRecipeData(recipe));
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw error;
        }
    }

    transformRecipeData(recipe) {
        try {
            return {
                id: recipe.id.toString(),
                title: recipe.title,
                description: recipe.summary,
                image: recipe.image,
                sourceUrl: recipe.sourceUrl,
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                nutrition: {
                    calories: this.getNutrientAmount(recipe, 'Calories'),
                    protein: this.getNutrientAmount(recipe, 'Protein'),
                    carbs: this.getNutrientAmount(recipe, 'Carbohydrates'),
                    fat: this.getNutrientAmount(recipe, 'Fat'),
                },
                ingredients: recipe.extendedIngredients?.map(ing => ({
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                })) || [],
                instructions: recipe.analyzedInstructions?.[0]?.steps?.map(step => ({
                    number: step.number,
                    step: step.step,
                })) || [],
                vegetableServings: this.estimateVegetableServings(recipe),
                difficulty: this.estimateRecipeDifficulty(recipe),
                diets: recipe.diets || [],
                dishTypes: recipe.dishTypes || [],
            };
        } catch (error) {
            console.error('Error transforming recipe data:', error);
            throw error;
        }
    }

    getNutrientAmount(recipe, nutrientName) {
        return recipe.nutrition?.nutrients?.find(n => n.name === nutrientName)?.amount || 0;
    }

    estimateVegetableServings(recipe) {
        const vegetableKeywords = [
            'vegetable', 'broccoli', 'spinach', 'carrot', 'kale', 
            'lettuce', 'pepper', 'onion', 'celery', 'cucumber', 
            'zucchini', 'tomato', 'asparagus', 'cauliflower'
        ];
        
        const vegetableIngredients = recipe.extendedIngredients?.filter(
            ing => vegetableKeywords.some(kw => ing.name.toLowerCase().includes(kw))
        ) || [];
        
        return Math.ceil(vegetableIngredients.length / 2);
    }

    estimateRecipeDifficulty(recipe) {
        const steps = recipe.analyzedInstructions?.[0]?.steps || [];
        const ingredients = recipe.extendedIngredients || [];
        
        if (steps.length <= 5 && ingredients.length <= 7) return 'easy';
        if (steps.length <= 10 && ingredients.length <= 12) return 'medium';
        return 'hard';
    }
}

export const spoonacularService = new SpoonacularService();
