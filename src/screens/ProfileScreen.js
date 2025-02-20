import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { supabase } from '../utils/supabase';

const ProfileScreen = ({ navigation }) => {
    // Placeholder data (replace with data from API)
  // const [upcomingAppointments, setUpcomingAppointments] = useState([
  //   {
  //     id: '1',
  //     date: new Date('2024-03-15T10:00:00'),
  //     location: 'Mirai Clinic Downtown',
  //   },
  //   {
  //     id: '2',
  //     date: new Date('2024-03-22T14:30:00'),
  //     location: 'Mirai Clinic Uptown',
  //   },
  // ]);

  // const [pastAppointments, setPastAppointments] = useState([
  //   {
  //     id: '3',
  //     date: new Date('2024-02-01T09:00:00'),
  //     location: 'Mirai Clinic Downtown',
  //     notes: 'Initial consultation. Discussed diet plan and goals.',
  //   },
  // ]);

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Store the user's ID

  const [currentWeight, setCurrentWeight] = useState(185); // in lbs
  const [goalWeight, setGoalWeight] = useState(150); // in lbs
  const [startWeight, setStartWeight] = useState(200); //in lbs
  const [lastWeight, setLastWeight] = useState(190);

  const [userName, setUserName] = useState(''); // Add state for userName
  const [profilePicture, setProfilePicture] = useState(''); // Add state for profile picture.

  // Fetch user data and appointments
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          navigation.navigate('Auth'); // Redirect to login if not logged in
          return;
        }

        setUserId(user.id); // Set the user ID

        // Fetch user data (name, profile picture)
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('first_name, profile_picture')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          Alert.alert('Error', 'Failed to fetch profile data.');
        } else if (profileData) {
            setUserName(profileData.first_name);
            setProfilePicture(profileData.profile_picture);
        }


        // Fetch upcoming appointments
        const { data: upcoming, error: upcomingError } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true });

        if (upcomingError) {
          console.error('Error fetching upcoming appointments:', upcomingError);
          Alert.alert('Error', 'Failed to fetch upcoming appointments.');
        } else {
          setUpcomingAppointments(
            upcoming.map((appointment) => ({
              ...appointment,
              date: new Date(appointment.date_time), // Convert to Date object
            }))
          );
        }

        // Fetch past appointments
      const { data: past, error: pastError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .lt('date_time', new Date().toISOString())
        .order('date_time', { ascending: false });

      if (pastError) {
        console.error('Error fetching past appointments:', pastError);
        Alert.alert('Error', 'Failed to fetch past appointments.');
      } else {
        setPastAppointments(
          past.map((appointment) => ({
            ...appointment,
            date: new Date(appointment.date_time), // Convert to Date object
          }))
        );
      }
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigation]);
  
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

  // const handleReschedule = async (appointmentId, newDateTime) => {
  //   try {
  //       setLoading(true)
  //     const { error } = await supabase
  //       .from('appointments')
  //       .update({ date_time: newDateTime.toISOString() }) // Update the date_time
  //       .eq('id', appointmentId) // Where the appointment ID matches
  //       .eq('user_id', userId);   // *Always* include user_id for security (RLS)

  //     if (error) {
  //       console.error('Error rescheduling appointment:', error);
  //       Alert.alert('Error', 'Failed to reschedule appointment.');
  //     } else {
  //       // Update the upcomingAppointments state to reflect the change
  //       // (You'll need to implement this part based on how you manage state)
  //       Alert.alert('Success', 'Appointment rescheduled successfully!');
  //       //Optionally refetch
  //     }
  //   } catch(err) {
  //       console.error("Unexpected error rescheduling", err);
  //       Alert.alert("Error", "An unexpected error occurred")
  //   } finally {
  //       setLoading(false);
  //   }
  // };

  const handleReschedule = (appointmentId) => {
    navigation.navigate('RescheduleAppointment', { appointmentId }); // Navigate and pass ID
  };

  const handleCancel = async (appointmentId) => {

    Alert.alert(
        "Cancel Appointment",
        "Are you sure you want to cancel this appointment?",
        [
            {
                text: "No",
                style: "cancel"
            },
            { text: "Yes", onPress: async () => {
                try {
                    setLoading(true);
                    const { error } = await supabase
                        .from('appointments')
                        .delete()
                        .eq('id', appointmentId)
                        .eq('user_id', userId); // Ensure user can only cancel their own appointments

                    if (error) {
                        console.error('Error canceling appointment:', error);
                        Alert.alert('Error', 'Failed to cancel appointment.');
                    } else {
                        // Remove the canceled appointment from the local state
                        setUpcomingAppointments(prevAppointments =>
                            prevAppointments.filter(appointment => appointment.id !== appointmentId)
                        );
                        Alert.alert('Success', 'Appointment canceled successfully!');
                    }
                } catch (err) {
                    console.error("Unexpected Error:", err);
                    Alert.alert("Error", "An unexpected error occurred")
                }
                finally {
                    setLoading(false);
                }
            }}
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

    // Placeholder diet plan data (replace with data from API)
  const [currentDietPlan, setCurrentDietPlan] = useState({
    name: 'Balanced Diet',
    calorieTarget: 2000,
    proteinTarget: 150,
    carbsTarget: 200,
    fatTarget: 60,
    allowedFoods: ['Chicken', 'Fish', 'Vegetables', 'Fruits', 'Whole Grains'],
    restrictedFoods: ['Processed Foods', 'Sugary Drinks', 'Excessive Saturated Fats'],
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.settingsPlaceholder} />
        <View style={styles.profileInfo}>
          <Image
                       source={profilePicture ? { uri: profilePicture } : require('../assets/images/placeholder-profile.png')}

            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userDetail}>Member Since: January 2024</Text>
          {/* Add more user details here as needed */}
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
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

      {/* Diet Plan Section */}
      <View style={styles.dietPlanSection}>
        <Text style={styles.sectionTitle}>Current Diet Plan</Text>
        <View style={styles.dietPlanOverview}>
          <Text>Calories: {currentDietPlan.calorieTarget} kcal</Text>
          <Text>Protein: {currentDietPlan.proteinTarget}g</Text>
          <Text>Carbs: {currentDietPlan.carbsTarget}g</Text>
          <Text>Fat: {currentDietPlan.fatTarget}g</Text>
        </View>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('DietPlan', { dietPlan: currentDietPlan })}
        >
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
         <TouchableOpacity onPress={() => navigation.navigate('DietPlanHistory')}>
            <Text style={styles.viewHistoryText}>View Diet Plan History</Text>
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
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    width: '100%',
  },
  profileInfo: {
    alignItems: 'center',
    flex: 1,
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
  settingsPlaceholder: {
    width: 34,
  },
  settingsButton: {
    padding: 5,
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
  },
  dietPlanSection: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  dietPlanOverview: {
    marginBottom: 10,
  },
  viewDetailsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
  },
});

export default ProfileScreen;