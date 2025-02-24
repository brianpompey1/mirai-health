export default {
  expo: {
    name: "mirai-health",
    // ... other existing expo config
    extra: {
      spoonacularApiKey: process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || "5b7cd4977c4a44b5bf4e57d259ebac4a",
    },
  },
};
