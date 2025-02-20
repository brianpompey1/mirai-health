import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>Privacy Policy</Text> */}
      <Text style={styles.content}>
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