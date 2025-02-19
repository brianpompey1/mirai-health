import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [preferredContactMethod, setPreferredContactMethod] = useState('text'); // 'text', 'phone', or 'email'

  const handleContactMethodChange = (method) => {
    setPreferredContactMethod(method);
    // TODO: Save the preference to your backend/local storage
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={(value) => setDarkMode(value)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={darkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* Preferred Contact Method */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Preferred Contact Method</Text>
        <View style={styles.contactOptions}>
          <TouchableOpacity
            style={[styles.contactOption, preferredContactMethod === 'text' && styles.selectedContactOption]}
            onPress={() => handleContactMethodChange('text')}
          >
            <Ionicons name="chatbox-ellipses-outline" size={24} color={preferredContactMethod === 'text' ? "white" : "black"} />
            <Text style={[styles.contactOptionText, preferredContactMethod === 'text' && styles.selectedContactOptionText]}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactOption, preferredContactMethod === 'phone' && styles.selectedContactOption]}
            onPress={() => handleContactMethodChange('phone')}
          >
            <Ionicons name="call-outline" size={24} color={preferredContactMethod === 'phone' ? "white" : "black"} />
            <Text style={[styles.contactOptionText, preferredContactMethod === 'phone' && styles.selectedContactOptionText]}>Phone Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactOption, preferredContactMethod === 'email' && styles.selectedContactOption]}
            onPress={() => handleContactMethodChange('email')}
          >
            <Ionicons name="mail-outline" size={24} color={preferredContactMethod === 'email' ? "white" : "black"} />
            <Text style={[styles.contactOptionText, preferredContactMethod === 'email' && styles.selectedContactOptionText]}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add more settings options here */}
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  settingText: {
    fontSize: 18,
    fontFamily: 'sans-serif',
  },
    settingSection: {
      backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'sans-serif-medium',
        marginBottom: 10
    },
    contactOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    contactOption: {
      alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        width: 100
    },
    selectedContactOption:{
      backgroundColor: '#007AFF',
        borderColor: '#007AFF'
    },
    contactOptionText: {
        marginTop: 5,
        fontFamily: 'sans-serif'
    },
    selectedContactOptionText: {
      color: 'white'
    }
});

export default SettingsScreen;