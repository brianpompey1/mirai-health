import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TermsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.content}>
        {/* Your Terms of Service content here.  This should be a long string or
            loaded from a separate file. */}
        Lorem ipsum dolor sit amet, consectetur adipiscing elit...
        {/* ... LOTS MORE TEXT ... */}
      </Text>
        <View style={{height: 30}}></View>
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

export default TermsScreen;