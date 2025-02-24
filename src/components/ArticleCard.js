import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ArticleCard = ({ article, onPress, style }) => {
  const { theme } = useTheme();

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'nutrition':
        return 'nutrition-outline';
      case 'exercise':
        return 'fitness-outline';
      case 'motivation':
        return 'trophy-outline';
      case 'meal-planning':
        return 'restaurant-outline';
      case 'lifestyle':
        return 'leaf-outline';
      default:
        return 'document-text-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        style
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Ionicons
              name={getCategoryIcon(article.category)}
              size={20}
              color={theme.text}
            />
            <Text style={[styles.category, { color: theme.text }]}>
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            {article.title}
          </Text>
        </View>

        <Text
          style={[styles.excerpt, { color: theme.textSecondary }]}
          numberOfLines={3}
        >
          {article.excerpt}
        </Text>

        <View style={styles.footer}>
          <View style={styles.tags}>
            {article.tags && article.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: theme.tagBackground }]}
              >
                <Text style={[styles.tagText, { color: theme.tagText }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.readingTime}>
            <Ionicons name="time-outline" size={16} color={theme.text} />
            <Text style={[styles.readingTimeText, { color: theme.text }]}>
              {article.reading_time} min read
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  excerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  readingTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTimeText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default ArticleCard;