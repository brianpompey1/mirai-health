import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { useTheme } from '../contexts/ThemeContext';

const RescheduleAppointmentScreen = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState(''); // Keep notes, in case they want to update
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null); // Store the appointment details
  const { theme } = useTheme();

  const { appointmentId } = route.params; // Get appointmentId from route params

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) {
        Alert.alert("Error", "No appointment ID provided.");
        navigation.goBack(); // Go back if no ID
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single(); // Use .single() since we expect only one result

        if (error) {
          console.error('Error fetching appointment:', error);
          Alert.alert('Error', 'Failed to fetch appointment details.');
          navigation.goBack();
          return;
        }

        if (data) {
            //VERY IMPORTANT: Set initial dates
          setAppointment(data); // Store the appointment data
          setSelectedDate(new Date(data.date_time));
          setSelectedTime(new Date(data.date_time));
          setNotes(data.notes || ''); // Load existing notes (if any)
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, navigation]); // Depend on appointmentId and navigation

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    const selectedDate = new Date(date);
    setSelectedDate(selectedDate);
    hideDatePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleTimeConfirm = (time) => {
    const selectedTime = new Date(time);
    setSelectedTime(selectedTime);
    hideTimePicker();
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString() : 'Select Date';
  };

  const formatTime = (time) => {
    if (!time) return 'Select Time';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both a date and a time.');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(selectedTime.getHours());
      combinedDateTime.setMinutes(selectedTime.getMinutes());

      const { error } = await supabase
        .from('appointments')
        .update({
          date_time: combinedDateTime.toISOString(),
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment:', error);
        Alert.alert('Error', 'Failed to reschedule appointment.');
        return;
      }

      Alert.alert(
        'Success',
        'Appointment rescheduled successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and trigger a refresh
              navigation.navigate('Profile', { refresh: Date.now() });
            }
          }
        ]
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

    if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Loading appointment details...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Appointment not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Reschedule Appointment</Text>
        
        <TouchableOpacity 
          style={[styles.pickerButton, { backgroundColor: theme.touchableBackground }]} 
          onPress={showDatePicker}
        >
          <Text style={[styles.pickerButtonText, { color: theme.text }]}>{formatDate(selectedDate)}</Text>
          <Ionicons name="calendar" size={24} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.pickerButton, { backgroundColor: theme.touchableBackground }]} 
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
          placeholder="Add any notes about rescheduling..."
          placeholderTextColor={theme.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: theme.buttonBackground }]}
          onPress={handleRescheduleSubmit}
          disabled={loading}
        >
          <Text style={[styles.submitButtonText, { color: theme.primary }]}>
            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
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
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
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

export default RescheduleAppointmentScreen;