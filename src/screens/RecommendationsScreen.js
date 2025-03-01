import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  Linking,
  Alert
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { recommendationsService } from '../services/recommendationsService';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';

const RecommendationsScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const loadRecommendations = useCallback(async () => {
    try {
      setError(null);
      const data = await recommendationsService.getPersonalizedRecommendations(user.id);
      
      if (!data?.recipes?.length) {
        setError('No recipes found matching your diet preferences. Please try again later.');
        setRecommendations([]);
        return;
      }
      
      setRecommendations(data.recipes);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations. Please check your internet connection and try again.');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRecommendations();
  }, [loadRecommendations]);

  const handleRecipePress = useCallback(async (recipe) => {
    if (recipe.sourceUrl) {
      try {
        const supported = await Linking.canOpenURL(recipe.sourceUrl);
        if (supported) {
          await Linking.openURL(recipe.sourceUrl);
        } else {
          Alert.alert('Error', 'Cannot open this recipe link.');
        }
      } catch (error) {
        console.error('Error opening recipe URL:', error);
        Alert.alert('Error', 'Failed to open recipe link. Please try again.');
      }
    } else {
      Alert.alert('Error', 'No recipe link available.');
    }
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={recommendations}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => handleRecipePress(item)}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              {error || 'No recommendations available at the moment.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RecommendationsScreen;