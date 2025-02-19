import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const RecipeCard = ({ recipe }) => { // Receives a 'recipe' object as a prop
  return (
    <TouchableOpacity style={styles.container} onPress={() => { /* TODO: Handle navigation to recipe details */ }}>
      <Image source={recipe.image ? {uri: recipe.image} : require('../assets/images/placeholder-recipe.jpg')} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>
        <Text style={styles.calories}>{recipe.calories} Calories</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden', // Clip image to rounded corners
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150, // Adjust as needed
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: 'gray',
    marginBottom: 5,
  },
  calories: {
    fontSize: 12,
    fontFamily: 'sans-serif',
    color: '#007AFF',
  },
});

export default RecipeCard;