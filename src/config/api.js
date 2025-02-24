import Constants from 'expo-constants';

// API configuration
export const SPOONACULAR_CONFIG = {
    API_KEY: Constants.expoConfig.extra.spoonacularApiKey,
    BASE_URL: 'https://api.spoonacular.com',
    ENDPOINTS: {
        RECIPE_SEARCH: '/recipes/complexSearch',
        RECIPE_INFO: '/recipes/informationBulk',
    }
};
