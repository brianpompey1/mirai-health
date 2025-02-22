import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const RecipeCard = ({ recipe }) => { // Receives a 'recipe' object as a prop
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
      }]} 
      onPress={() => { /* TODO: Handle navigation to recipe details */ }}
    >
      <Image 
        source={recipe.image ? {uri: recipe.image} : require('../assets/images/placeholder-recipe.jpg')} 
        style={styles.image} 
      />
      <View style={[styles.textContainer, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
        <Text style={[styles.description, { color: theme.text }]}>{recipe.description}</Text>
        <View style={[styles.footer, { backgroundColor: theme.touchableBackground }]}>
          <Text style={[styles.calories, { color: theme.primary }]}>{recipe.calories} Calories</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
  },
  textContainer: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    marginBottom: 12,
  },
  footer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  calories: {
    fontSize: 14,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center',
  },
});

export default RecipeCard;