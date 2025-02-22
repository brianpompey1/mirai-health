import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const DashboardHeader = ({ userName, profilePicture }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={profilePicture ? {uri: profilePicture} : require('../assets/images/placeholder-profile.png')} style={styles.profileImage} />
      <View style={[styles.textContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.greeting, { color: theme.text }]}>Welcome back,</Text>
        <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    // fontFamily: 'Inter', // REMOVE THIS
    // No fontFamily needed - defaults to sans-serif
  },
  userName: {
    fontSize: 24,
    // fontFamily: 'Inter', // REMOVE THIS
    fontFamily: 'sans-serif-medium', // Use a system font
    fontWeight: 'bold', // You can still use fontWeight
  },
});

export default DashboardHeader;