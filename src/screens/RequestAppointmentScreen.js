import React, { useState, useEffect } from 'react'; // Import useEffect
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

const RequestAppointmentScreen = ({ navigation, route }) => { // Get route
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Request Appointment</Text>

      <TouchableOpacity style={styles.dateTimeButton} onPress={showDatePicker}>
        <Text style={styles.dateTimeButtonText}>{formatDate(selectedDate)}</Text>
        <Ionicons name="calendar-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        themeVariant="light"
        headerText="Select Date"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <TouchableOpacity style={styles.dateTimeButton} onPress={showTimePicker}>
        <Text style={styles.dateTimeButtonText}>{formatTime(selectedTime)}</Text>
        <Ionicons name="time-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
        is24Hour={false}
        themeVariant="light"
        headerText="Select Time"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <Text style={styles.label}>Notes (Optional):</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes about your request..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
      </TouchableOpacity>
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
  dateTimeButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeButtonText: {
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
  label: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5,
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'sans-serif',
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
  },
});

export default RequestAppointmentScreen;