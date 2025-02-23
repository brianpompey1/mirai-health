import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  Linking
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
      const data = await recommendationsService.getPersonalizedRecommendations(user.id);
      setRecommendations(data.recipes);
      setError(null);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
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
        }
      } catch (error) {
        console.error('Error opening recipe URL:', error);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
        </View>
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
            onPress={handleRecipePress}
          />
        )}
        keyExtractor={(item) => item.id}
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
              No recommendations available at the moment.
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
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default RecommendationsScreen;