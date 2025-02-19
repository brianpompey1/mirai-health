import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ArticleCard = ({ article }) => { // Receives an 'article' object as a prop
  return (
    <TouchableOpacity style={styles.container} onPress={() => { /* TODO: Handle navigation to article details */ }}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.excerpt}>{article.excerpt}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5,
  },
  excerpt: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: 'gray',
  },
});

export default ArticleCard;