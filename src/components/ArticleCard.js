import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const ArticleCard = ({ article }) => { // Receives an 'article' object as a prop
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.container, { 
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
      }]} 
      onPress={() => { /* TODO: Handle navigation to article details */ }}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{article.title}</Text>
        <Text style={[styles.excerpt, { color: theme.text }]}>{article.excerpt}</Text>
      </View>
      <View style={[styles.footer, { backgroundColor: theme.touchableBackground }]}>
        <Text style={[styles.readMore, { color: theme.primary }]}>Read More</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    marginBottom: 4,
  },
  footer: {
    padding: 12,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  readMore: {
    fontSize: 14,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center',
  },
});

export default ArticleCard;