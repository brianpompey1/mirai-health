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
        isDarkModeEnabled={false}
        display="inline"
        themeVariant="light"
        accentColor="#007AFF"
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
        isDarkModeEnabled={false}
        display="spinner"
        themeVariant="light"
        accentColor="#007AFF"
      />

      <Text style={styles.label}>Notes (Optional):</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes about your appointment request..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Request Appointment'}
        </Text>
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
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  dateTimeButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RequestAppointmentScreen;