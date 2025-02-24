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
        maxCarbs,
    }) {
        try {
            const params = new URLSearchParams({
                apiKey: this.apiKey,
                number: number || 50,
                addRecipeInformation: true,
                fillIngredients: true,
                addRecipeNutrition: true,
                sort: 'max-used-ingredients',
                sortDirection: 'desc'
            });

            // Add optional parameters if they exist
            if (maxCalories) params.append('maxCalories', maxCalories);
            if (minProtein) params.append('minProtein', minProtein);
            if (diet) params.append('diet', diet);
            if (query) params.append('query', query);
            if (maxCarbs) params.append('maxCarbs', maxCarbs);

            const url = `${this.baseUrl}/recipes/complexSearch?${params.toString()}`;
            console.log('Searching recipes with URL:', url);

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Spoonacular API error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('API response:', {
                totalResults: data.totalResults,
                offset: data.offset,
                number: data.number,
                results: data.results?.length
            });

            if (!data.results?.length) {
                console.log('No results found');
                return [];
            }

            // Transform the recipes into our format
            return data.results.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                sourceUrl: recipe.sourceUrl,
                difficulty: this.calculateDifficulty(recipe), 
                nutrition: {
                    calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                    protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                    carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
                    fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0
                },
                ingredients: recipe.extendedIngredients?.map(ingredient => ({
                    id: ingredient.id,
                    name: ingredient.name,
                    amount: ingredient.amount,
                    unit: ingredient.unit,
                    original: ingredient.original
                })) || []
            }));
        } catch (error) {
            console.error('Error searching recipes:', error);
            return [];
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

    calculateDifficulty(recipe) {
        // Base score starts at 0
        let difficultyScore = 0;
        
        // Factor 1: Cooking time
        if (recipe.readyInMinutes > 60) difficultyScore += 2;
        else if (recipe.readyInMinutes > 30) difficultyScore += 1;
        
        // Factor 2: Number of ingredients
        if (recipe.extendedIngredients?.length > 10) difficultyScore += 2;
        else if (recipe.extendedIngredients?.length > 5) difficultyScore += 1;
        
        // Factor 3: Number of steps (if available)
        const numSteps = recipe.analyzedInstructions?.[0]?.steps?.length || 0;
        if (numSteps > 10) difficultyScore += 2;
        else if (numSteps > 5) difficultyScore += 1;
        
        // Convert score to difficulty level
        if (difficultyScore >= 4) return 'hard';
        if (difficultyScore >= 2) return 'medium';
        return 'easy';
    }
}

export const spoonacularService = new SpoonacularService();
