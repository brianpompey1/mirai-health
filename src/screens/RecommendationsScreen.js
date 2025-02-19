import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import ArticleCard from '../components/ArticleCard';

const RecommendationsScreen = () => {
  // Placeholder data (replace with data from your API)
  const [recipes, setRecipes] = useState([
    {
      id: '1',
      title: 'Grilled Salmon with Asparagus',
      description: 'A healthy and delicious meal rich in omega-3 fatty acids.',
      calories: 450,
      image: '', // Add a URL or local path
    },
    {
      id: '2',
      title: 'Quinoa Salad with Chickpeas',
      description: 'A vegetarian option packed with protein and fiber.',
      calories: 380,
      image: '',
    },
    {
      id: '3',
      title: 'Chicken Stir-Fry with Brown Rice',
      description: 'A quick and easy stir-fry with lean protein and whole grains.',
      calories: 500,
      image: '',
    },
  ]);

  const [articles, setArticles] = useState([
    {
      id: '1',
      title: 'The Benefits of High-Intensity Interval Training (HIIT)',
      excerpt: 'Learn how HIIT workouts can boost your metabolism and burn fat efficiently.',
    },
    {
      id: '2',
      title: 'Understanding Macronutrients: Protein, Carbs, and Fats',
      excerpt: 'A guide to understanding the role of macronutrients in weight loss and overall health.',
    },
    {
      id: '3',
      title: 'Healthy Snacking for Weight Loss',
      excerpt: 'Tips and ideas for choosing healthy snacks that support your weight loss goals.',
    },
  ]);

  const renderRecipeItem = ({ item }) => <RecipeCard recipe={item} />;
  const renderArticleItem = ({ item }) => <ArticleCard article={item} />;

  // Format data for SectionList
  const sections = [
    {
      title: 'Recommended Recipes',
      data: recipes,
      renderItem: renderRecipeItem,
    },
    {
      title: 'Helpful Articles & Information',
      data: articles,
      renderItem: renderArticleItem,
    },
  ];

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item, section }) => section.renderItem({ item });

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    padding: 15,
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'sans-serif-medium',
    marginBottom: 10,
  },
});

export default RecommendationsScreen;