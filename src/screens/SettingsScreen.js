import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native'; // Import ScrollView
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({navigation}) => { //Get navigation prop
  const [darkMode, setDarkMode] = useState(false);
  const [preferredContactMethod, setPreferredContactMethod] = useState('text'); // 'text', 'phone', or 'email'
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [coachMessages, setCoachMessages] = useState(true);

    const handleContactMethodChange = (method) => {
        setPreferredContactMethod(method);
        // TODO: Save the preference to your backend/local storage
      };

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>Settings</Text> */}

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

      {/* Notification Preferences */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Appointment Reminders</Text>
          <Switch
            value={appointmentReminders}
            onValueChange={setAppointmentReminders}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={appointmentReminders ? "#007AFF" : "#f4f3f4"}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Meal Reminders</Text>
          <Switch
            value={mealReminders}
            onValueChange={setMealReminders}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={mealReminders ? "#007AFF" : "#f4f3f4"}

          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Progress Updates</Text>
          <Switch
            value={progressUpdates}
            onValueChange={setProgressUpdates}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={progressUpdates ? "#007AFF" : "#f4f3f4"}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Coach Messages</Text>
          <Switch
            value={coachMessages}
            onValueChange={setCoachMessages}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={coachMessages ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>

        {/* Support and Help Section */}
        <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Support & Help</Text>
            <TouchableOpacity style={styles.settingItem} onPress={()=> navigation.navigate('Support', {screen: 'FAQ'})}>
                <Text style={styles.settingText}>FAQ</Text>
                <Ionicons name='chevron-forward' size={24} color='gray'/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={()=> navigation.navigate('Support', {screen: 'ContactSupport'})}>
                <Text style={styles.settingText}>Contact Support</Text>
                <Ionicons name='chevron-forward' size={24} color='gray'/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={()=> navigation.navigate('Support', {screen: 'Terms'})}>
                <Text style={styles.settingText}>Terms of Service</Text>
                <Ionicons name='chevron-forward' size={24} color='gray'/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={()=> navigation.navigate('Support', {screen: 'PrivacyPolicy'})}>
                <Text style={styles.settingText}>Privacy Policy</Text>
                <Ionicons name='chevron-forward' size={24} color='gray'/>
            </TouchableOpacity>
        </View>

      <View style={{height: 30}}></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'sans-serif-medium',
    marginBottom: 20,
      padding: 20
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