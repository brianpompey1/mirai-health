import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';

const ProfileScreen = ({ navigation }) => {
    // Placeholder data (replace with data from API)
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: '1',
      date: new Date('2024-03-15T10:00:00'),
      location: 'Mirai Clinic Downtown',
    },
    {
      id: '2',
      date: new Date('2024-03-22T14:30:00'),
      location: 'Mirai Clinic Uptown',
    },
  ]);

  const [pastAppointments, setPastAppointments] = useState([
    {
      id: '3',
      date: new Date('2024-02-01T09:00:00'),
      location: 'Mirai Clinic Downtown',
      notes: 'Initial consultation. Discussed diet plan and goals.',
    },
  ]);

  const [currentWeight, setCurrentWeight] = useState(185); // in lbs
    const [goalWeight, setGoalWeight] = useState(150); // in lbs
    const [startWeight, setStartWeight] = useState(200); //in lbs
    const [lastWeight, setLastWeight] = useState(190);

    useEffect(() => {
        (async () => {
          if (Platform.OS !== 'web') {
              const { status } = await Calendar.requestCalendarPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission to access calendar was denied');
              }
            }
        })();
      }, []);

  const handleReschedule = (appointmentId) => {
    // TODO: Implement reschedule logic (open a modal/screen to select a new date/time)
    // For now, just log the ID
    console.log('Reschedule appointment:', appointmentId);
    Alert.alert('Reschedule', `Reschedule appointment ${appointmentId} (Implementation coming soon)`);
  };

  const handleCancel = (appointmentId) => {
     // TODO:  Implement cancel logic (call API)
     console.log('Cancel appointment:', appointmentId);
      Alert.alert(
          "Cancel Appointment",
          "Are you sure you want to cancel this appointment?",
          [
              {
                  text: "Cancel",
                  style: "cancel"
              },
              { text: "OK", onPress: () => {
                  //Placeholder for cancel
                  setUpcomingAppointments(prevAppointments => prevAppointments.filter(appointment => appointment.id != appointmentId))
              } }
          ]
      );
  };

  const addToCalendar = async (appointment) => {
    try {
      const defaultCalendarSource =
        Platform.OS === 'ios'
          ? await Calendar.getDefaultCalendarAsync(Calendar.EntityTypes.EVENT) // For iOS
          : { isLocalAccount: true, name: 'Expo Calendar' }; //For Android

      // You might want a more sophisticated way to get/create a calendar
        const newCalendarID = await Calendar.createCalendarAsync({
          title: 'Mirai Appointments',
          color: 'blue',
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: defaultCalendarSource.id,
          source : defaultCalendarSource,
          name: 'internalCalendarName',
          ownerAccount: 'personal',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,

        });

        const eventId = await Calendar.createEventAsync(newCalendarID, {
            startDate: appointment.date,
            endDate: new Date(appointment.date.getTime() + 60 * 60 * 1000), // Assume 1-hour appointments
            title: 'Appointment with Mirai Weight Loss',
            location: appointment.location,
            notes: 'Remember to bring your food log.',
            timeZone: 'America/Los_Angeles', // Replace with user's timezone
        });

      Alert.alert('Success', 'Appointment added to calendar!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Failed to add appointment to calendar.');
    }
  };

    const formatDate = (date) => {
      return date.toLocaleDateString();
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }

    const weightChangeSinceStart = currentWeight - startWeight;
    const weightChangeSinceLast = currentWeight - lastWeight;

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <Image
          source={require('../assets/images/placeholder-profile.png')} // Use your placeholder
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Brian Pompey</Text>
        <Text style={styles.userDetail}>Member Since: January 2024</Text>
        {/* Add more user details here as needed */}
      </View>

      <TouchableOpacity
        style={styles.editProfileButton} 
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.appointmentButton}
        onPress={() => navigation.navigate('RequestAppointment')} // Navigate to RequestAppointmentScreen
      >
        <Text style={styles.appointmentButtonText}>Request Appointment</Text>
      </TouchableOpacity>

      {/* Weight Progress Section */}
      <View style={styles.weightProgressSection}>
        <Text style={styles.sectionTitle}>Weight Progress</Text>
        <View style={styles.weightItem}>
          <Text style={styles.weightLabel}>Current Weight:</Text>
          <Text style={styles.weightValue}>{currentWeight} lbs</Text>
        </View>
        <View style={styles.weightItem}>
          <Text style={styles.weightLabel}>Goal Weight:</Text>
          <Text style={styles.weightValue}>{goalWeight} lbs</Text>
        </View>
        <View style={styles.weightItem}>
          <Text style={styles.weightLabel}>Change Since Start:</Text>
          <Text style={[styles.weightValue, { color: weightChangeSinceStart <= 0 ? 'green' : 'red' }]}>
            {weightChangeSinceStart} lbs
          </Text>
        </View>
        <View style={styles.weightItem}>
          <Text style={styles.weightLabel}>Change Since Last Weigh-In:</Text>
          <Text style={[styles.weightValue, { color: weightChangeSinceLast <= 0 ? 'green' : 'red' }]}>
            {weightChangeSinceLast} lbs
          </Text>
        </View>
        <TouchableOpacity onPress={() => {/* TODO: Navigate to detailed weight history screen */ }}>
            <Text style={styles.viewHistoryText}>View Weight History Chart</Text>
        </TouchableOpacity>
      </View>

       {/* Upcoming Appointments */}
       <View style={styles.appointmentsSection}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentItem}>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentDate}>{formatDate(appointment.date)}</Text>
                <Text style={styles.appointmentTime}>{formatTime(appointment.date)}</Text>
                <Text style={styles.appointmentLocation}>{appointment.location}</Text>
              </View>
              <View style={styles.appointmentActions}>
                <TouchableOpacity onPress={() => handleReschedule(appointment.id)}>
                  <Text style={styles.actionButton}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCancel(appointment.id)}>
                  <Text style={[styles.actionButton, styles.cancelButton]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addToCalendar(appointment)}>
                    <Ionicons name='calendar-outline' size={24} color='#007AFF'/>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noAppointmentsText}>No upcoming appointments.</Text>
        )}
      </View>

      {/* Past Appointments */}
      <View style={styles.appointmentsSection}>
        <Text style={styles.sectionTitle}>Past Appointments</Text>
        {pastAppointments.length > 0 ? (
          pastAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentItem}>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentDate}>{formatDate(appointment.date)}</Text>
                <Text style={styles.appointmentTime}>{formatTime(appointment.date)}</Text>
                <Text style={styles.appointmentLocation}>{appointment.location}</Text>
                {appointment.notes && (
                  <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noAppointmentsText}>No past appointments.</Text>
        )}
      </View>
        <View style={{height: 30}}></View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Light gray background
    },
  container: {
    flexGrow: 1,
    // backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'sans-serif-medium',
  },
  settingsButton: {
    padding: 5, // Add some padding for easier tapping
  },
  profileInfo: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circular image
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: 'gray',
  },
  editProfileButton: {
    backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        margin: 10,
    },
    editProfileButtonText: {
      color: 'white',
        fontSize: 18,
        fontFamily: 'sans-serif-medium',
        textAlign: 'center'
    },
  appointmentButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 10,
  },
  appointmentButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center'
  },
  appointmentsSection: {
    backgroundColor: 'white',
    margin: 10, // Reduced margin
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 10,
  },
  appointmentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  appointmentDetails: {
    marginBottom: 5,
  },
  appointmentDate: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
  },
  appointmentTime: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: 'gray',
  },
  appointmentLocation: {
    fontSize: 14,
    fontFamily: 'sans-serif',
  },
  appointmentNotes: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: 'gray',
    marginTop: 5,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute buttons evenly
    alignItems: 'center',           // Vertically center buttons
    marginTop: 5,
  },
  actionButton: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'sans-serif',
    marginRight: 10 // Add spacing
  },
  cancelButton: {
    color: 'red', // Distinguish cancel button
  },
    noAppointmentsText: {
      fontFamily: 'sans-serif',
        color: 'gray',
        textAlign: 'center',
        padding: 10
    },
    weightProgressSection: {
      backgroundColor: 'white',
      margin: 10,
      borderRadius: 10,
      padding: 15
  },
  weightItem: {
    flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5
  },
  weightLabel: {
    fontSize: 16,
      fontFamily: 'sans-serif'
  },
  weightValue: {
    fontSize: 16,
      fontFamily: 'sans-serif-medium'
  },
  viewHistoryText: {
      color: '#007AFF',
      textAlign: 'center',
      marginTop: 10,
      fontSize: 16
  }
});

export default ProfileScreen;