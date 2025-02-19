import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FAQScreen = () => {
  // Placeholder FAQ data - replace with your actual FAQs
  const faqData = [
    { question: 'How do I track my meals?', answer: 'Go to the Log tab and tap the "+" button to add a meal.' },
    { question: 'How do I schedule an appointment?', answer: 'Go to the Profile tab and tap "Request Appointment".' },
    { question: 'How do I change my password?', answer: 'Go to Profile -> Edit Profile to change your password.' },
    // ... more FAQs ...
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      {faqData.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <Text style={styles.question}>{item.question}</Text>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      ))}
        <View style={{height: 30}}></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'sans-serif-medium',
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  question: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
});

export default FAQScreen;