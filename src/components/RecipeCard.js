import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const RecipeCard = ({ recipe, style, onPress }) => {
    const { theme } = useTheme();

    const handlePress = async () => {
        if (onPress) {
            onPress(recipe);
        } else if (recipe.sourceUrl) {
            try {
                const supported = await Linking.canOpenURL(recipe.sourceUrl);
                if (supported) {
                    await Linking.openURL(recipe.sourceUrl);
                }
            } catch (error) {
                console.error('Error opening recipe URL:', error);
            }
        }
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={[styles.card, { backgroundColor: theme.cardBackground }, style]}>
                {recipe.image && (
                    <Image
                        source={{ uri: recipe.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                        {recipe.title}
                    </Text>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="flame-outline" size={16} color="#FF6B6B" />
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>
                                {Math.round(recipe.nutrition.calories)} cal
                            </Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Ionicons name="barbell-outline" size={16} color="#4A90E2" />
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>
                                {Math.round(recipe.nutrition.protein)}g protein
                            </Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={16} color="#82C091" />
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>
                                {recipe.readyInMinutes} min
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.difficultyContainer}>
                            <Ionicons 
                                name="fitness-outline" 
                                size={16} 
                                color="#9F8FFF"
                            />
                            <Text style={[styles.difficultyText, { color: theme.textSecondary }]}>
                                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                            </Text>
                        </View>
                        
                        <View style={styles.sourceContainer}>
                            <Ionicons name="open-outline" size={16} color="#666" />
                            <Text style={[styles.sourceText, { color: theme.textSecondary }]}>View Recipe</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 4,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    difficultyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    difficultyText: {
        marginLeft: 4,
        fontSize: 14,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sourceText: {
        marginLeft: 4,
        fontSize: 14,
    },
});

export default React.memo(RecipeCard);