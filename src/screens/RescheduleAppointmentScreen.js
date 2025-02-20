import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

const RescheduleAppointmentScreen = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState(''); // Keep notes, in case they want to update
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null); // Store the appointment details

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

  const handleRescheduleSubmit = async () => {
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
            Alert.alert('Error', 'You must be logged in to reschedule an appointment.');
            navigation.navigate('Auth'); // Redirect to login
            return;
        }

      const { error } = await supabase
        .from('appointments')
        .update({
          date_time: appointmentDateTime.toISOString(),
          notes: notes, // Include updated notes
          status: 'pending', // Reset status to pending after reschedule. Good practice
        })
        .eq('id', appointmentId)
        .eq('user_id', user.id); // *Crucial* for security (RLS)

      if (error) {
        console.error('Error rescheduling appointment:', error);
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Appointment rescheduled successfully!');
        navigation.goBack(); // Navigate back to the Profile screen
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

    if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading appointment details...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text>Appointment not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reschedule Appointment</Text>

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
      />

      <Text style={styles.label}>Notes (Optional):</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes about the reschedule..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleRescheduleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Rescheduling...' : 'Reschedule'}
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

export default RescheduleAppointmentScreen;