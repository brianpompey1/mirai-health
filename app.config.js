export default {
  expo: {
    name: "mirai-health",
    // ... other existing expo config
    extra: {
      spoonacularApiKey: process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || "5b7cd4977c4a44b5bf4e57d259ebac4a",
      eas: {
        projectId: "27803ea1-10f7-4980-8e25-fc685ab50fda"
      }
    },
    ios: {
      bundleIdentifier: "com.miraihealth.app",
      "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false
    }
    }
  },
};
