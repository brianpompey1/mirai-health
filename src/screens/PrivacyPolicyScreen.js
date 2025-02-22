import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const PrivacyPolicyScreen = () => {
  const { theme } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* <Text style={[styles.title, { color: theme.text }]}>Privacy Policy</Text> */}
      <Text style={[styles.content, { color: theme.text }]}>
        {/* Your Privacy Policy content here. */}
        {/* Your Privacy Policy content here. */}
        Your privacy is important to us...
        {/* ... LOTS MORE TEXT ... */}
      </Text>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 20
    },
    title: {
        fontSize: 24,
        fontFamily: 'sans-serif-medium',
        marginBottom: 20
    },
    content: {
        fontSize: 16,
        fontFamily: 'sans-serif'
    }
});

export default PrivacyPolicyScreen;