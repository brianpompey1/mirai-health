import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ContactSupportScreen = () => {

  const openEmail = () => {
    Linking.openURL('mailto:support@miraiweightloss.com?subject=App Support'); // Replace with your support email
  };

  const makePhoneCall = () => {
    let phoneNumber = 'tel:+15551234567'; // Replace with your support phone number
      if (Platform.OS === 'android') {
          phoneNumber = `tel:${15551234567}`
      }
    Linking.openURL(phoneNumber);
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Contact Support</Text> */}

      <TouchableOpacity style={styles.contactOption} onPress={openEmail}>
          <Ionicons name='mail-outline' size={24} color='#007AFF'/>
        <Text style={styles.contactText}>Email Support</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactOption} onPress={makePhoneCall}>
        <Ionicons name='call-outline' size={24} color='#007AFF'/>
        <Text style={styles.contactText}>Call Support</Text>
      </TouchableOpacity>

      {/* Add in-app messaging option here when you implement it */}
    </View>
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
    contactOption: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center'
    },
    contactText: {
        fontSize: 18,
        fontFamily: 'sans-serif',
        marginLeft: 10
    }
});

export default ContactSupportScreen;