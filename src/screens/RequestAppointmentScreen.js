import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { useTheme } from '../contexts/ThemeContext';

const RequestAppointmentScreen = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  // Get the closeModal function from the route params
  const { closeModal } = route.params || {};

  // Use useEffect to close the AddActionModal when this screen mounts
  useEffect(() => {
    if (closeModal) {
      closeModal();
    }
  }, [closeModal]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleTimeConfirm = (time) => {
    const selected = new Date(time);
    selected.setFullYear(1970, 0, 1);
    setSelectedTime(selected);
    hideTimePicker();
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString() : 'Select Date';
  };

  const formatTime = (time) => {
    if (!time) return 'Select Time';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both a date and a time.');
      return;
    }

    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(selectedTime.getHours());
    appointmentDateTime.setMinutes(selectedTime.getMinutes());
    appointmentDateTime.setSeconds(0, 0);

    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert('Error', 'You must be logged in to request an appointment.');
        navigation.navigate('Auth');
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: user.id,
            date_time: appointmentDateTime.toISOString(),
            location: 'Mirai Clinic',
            notes: notes,
          },
        ])
        .select();

      if (error) {
        console.error('Error requesting appointment:', error);
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Appointment request submitted successfully! You will be contacted shortly.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Select Date and Time</Text>
        
        <TouchableOpacity 
          style={[
            styles.pickerButton,
            { 
              backgroundColor: theme.touchableBackground,
              borderColor: theme.border,
              borderWidth: 1
            }
          ]} 
          onPress={showDatePicker}
        >
          <Text style={[styles.pickerButtonText, { color: theme.text }]}>{formatDate(selectedDate)}</Text>
          <Ionicons name="calendar" size={24} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.pickerButton,
            { 
              backgroundColor: theme.touchableBackground,
              borderColor: theme.border,
              borderWidth: 1
            }
          ]} 
          onPress={showTimePicker}
        >
          <Text style={[styles.pickerButtonText, { color: theme.text }]}>{formatTime(selectedTime)}</Text>
          <Ionicons name="time" size={24} color={theme.primary} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.touchableBackground,
            color: theme.text,
            borderColor: theme.border
          }]}
          placeholder="Add any notes or special requests..."
          placeholderTextColor={theme.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: theme.actionButton }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={[styles.submitButtonText, { color: theme.actionButtonText }]}>
            {loading ? 'Requesting...' : 'Request Appointment'}
          </Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        isDarkModeEnabled={theme.dark}
        display="inline"
        themeVariant={theme.dark ? "dark" : "light"}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
        is24Hour={false}
        isDarkModeEnabled={theme.dark}
        display="spinner"
        themeVariant={theme.dark ? "dark" : "light"}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    marginBottom: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
    fontFamily: 'sans-serif',
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
  },
});

export default RequestAppointmentScreen;