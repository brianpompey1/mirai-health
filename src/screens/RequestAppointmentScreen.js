import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

const RequestAppointmentScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(null); // Store selected date
  const [selectedTime, setSelectedTime] = useState(null); // Store selected time
  const [notes, setNotes] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

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
      // Extract hours and minutes.  Date part is irrelevant.
      const selected = new Date(time);
      selected.setFullYear(1970, 0, 1); // Set to a standard date
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

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both a date and a time.');
      return;
    }

    // Combine date and time into a single Date object (for sending to backend)
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(selectedTime.getHours());
    appointmentDateTime.setMinutes(selectedTime.getMinutes());

    // Placeholder for API call (replace with your actual API call)
    // Example:
    /*
    fetch('/api/appointments/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateTime: appointmentDateTime,
        notes,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Alert.alert('Success', 'Appointment request submitted successfully! You will be contacted shortly.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to submit appointment request.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while submitting your request.');
    });
    */
    // For now just show success
      Alert.alert("Success", "Appointment request submitted");
      navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Request Appointment</Text>

      <TouchableOpacity style={styles.dateTimeButton} onPress={showDatePicker}>
        <Text style={styles.dateTimeButtonText}>{formatDate(selectedDate)}</Text>
          <Ionicons name='calendar-outline' size={24} color='#007AFF'/>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
          minimumDate={new Date()} // Optional: Prevent selecting past dates
      />

      <TouchableOpacity style={styles.dateTimeButton} onPress={showTimePicker}>
          <Text style={styles.dateTimeButtonText}>{formatTime(selectedTime)}</Text>
          <Ionicons name='time-outline' size={24} color='#007AFF'/>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
        is24Hour={false} // Use 12-hour format
      />

      <Text style={styles.label}>Notes (Optional):</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes about your request..."
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Request</Text>
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
    justifyContent: 'space-between'
  },
    dateTimeButtonText: {
      fontSize: 16
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
    height: 100, // Multiline input height
      textAlignVertical: 'top'
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