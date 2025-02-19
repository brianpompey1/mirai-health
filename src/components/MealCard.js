import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MealCard = () => {
  return (
    <View style={styles.container}>
      <Text>Meal Card Placeholder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'lightyellow',
        padding: 20
    }
})

export default MealCard;