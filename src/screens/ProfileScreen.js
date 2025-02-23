import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Platform
} from 'react-native';
import { supabase } from '../utils/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen = ({ navigation, route }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [currentWeight, setCurrentWeight] = useState(0); // Initialize to 0
  const [goalWeight, setGoalWeight] = useState(0); //  Make dynamic later
  const [startWeight, setStartWeight] = useState(0);  // Initialize to 0
  const [lastWeight, setLastWeight] = useState(0);
  const [currentDietPlan, setCurrentDietPlan] = useState(null); // Initialize as null
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const { theme } = useTheme();

  // Function to fetch all profile data
  const fetchAllProfileData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigation.navigate('Auth');
        return;
      }

      setUserId(user.id);

      // Fetch appointments
      const now = new Date().toISOString();
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date_time', { ascending: true });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else if (appointmentsData) {
        const upcoming = appointmentsData.filter(apt => apt.date_time > now);
        const past = appointmentsData.filter(apt => apt.date_time <= now);
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      }

      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('first_name, profile_picture, start_weight, goal_weight')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setUserName(profileData.first_name);
        setProfilePicture(profileData.profile_picture);
        if (profileData.start_weight) {
          setStartWeight(profileData.start_weight);
        }
        if (profileData.goal_weight) {
          setGoalWeight(profileData.goal_weight);
        }
      }

      // Fetch diet plan separately from user_diet_plans table
      const { data: dietPlanData, error: dietPlanError } = await supabase
        .from('user_diet_plans')
        .select(`
          diet_plans (
            id,
            name,
            description,
            daily_protein_calories,
            daily_vegetable_servings,
            daily_fruit_servings
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (!dietPlanError && dietPlanData?.diet_plans) {
        setCurrentDietPlan(dietPlanData.diet_plans);
      }

      // Fetch weight progress
      const { data: weightData, error: weightError } = await supabase
        .from('user_progress')
        .select('date, weight')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!weightError && weightData && weightData.length > 0) {
        setCurrentWeight(weightData[0].weight);
        if (weightData.length > 1) {
          setLastWeight(weightData[1].weight);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAllProfileData();
    }, [])
  );

  // Also refresh when route.params.refresh changes
  useEffect(() => {
    if (route.params?.refresh) {
      fetchAllProfileData();
    }
  }, [route.params?.refresh]);

  // Calculate weight changes *after* we have all the data
  const weightChangeSinceStart =
    startWeight && currentWeight ? currentWeight - startWeight : 0; // Prevent NaN
  const weightChangeSinceLast =
    lastWeight && currentWeight ? currentWeight - lastWeight : 0; // Prevent NaN

  const handleReschedule = (appointmentId) => {
    navigation.navigate('RescheduleAppointment', { appointmentId });
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
    // ... (your existing addToCalendar function - no changes needed) ...
    try {
      const defaultCalendarSource =
        Platform.OS === 'ios'
          ? await Calendar.getDefaultCalendarAsync(Calendar.EntityTypes.EVENT) // For iOS
          : { isLocalAccount: true, name: 'Expo Calendar' }; //For Android
      const newCalendarID = await Calendar.createCalendarAsync({
        title: 'Mirai Appointments',
        color: 'blue',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MessageCenter')}
          style={styles.messageIcon}
        >
          <Ionicons name="mail" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View> */}
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.topSection, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MessageCenter')}
          style={styles.messageIcon}
        >
          <Ionicons name="mail" size={24} color={theme.text} />
        </TouchableOpacity>
          <View style={[styles.settingsPlaceholder, { backgroundColor: theme.background }]} />
          <View style={[styles.profileInfo, { backgroundColor: theme.background }]}>
            <Image
              source={profilePicture ? { uri: profilePicture } : require('../assets/images/placeholder-profile.png')}

              style={styles.profileImage}
            />
            <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
            <Text style={[styles.userDetail, { color: theme.text }]}>Member Since: January 2024</Text>
            {/* Add more user details here as needed */}
          </View>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: theme.background }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.actionButton,
                borderColor: theme.border,
                marginRight: 8,
              },
            ]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={[styles.actionButtonText, { color: theme.actionButtonText }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.actionButton,
                borderColor: theme.border,
                marginLeft: 8,
              },
            ]}
            onPress={() => navigation.navigate('RequestAppointment')}
          >
            <Text style={[styles.actionButtonText, { color: theme.actionButtonText }]}>
              Request Appointment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weight Progress Section */}
        <View style={[styles.weightProgressSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Weight Progress</Text>
          <View style={[styles.weightItem, { backgroundColor: theme.background }]}>
            <Text style={[styles.weightLabel, { color: theme.text }]}>Current Weight:</Text>
            <Text style={[styles.weightValue, { color: theme.text }]}>{currentWeight} lbs</Text>
          </View>
          <View style={[styles.weightItem, { backgroundColor: theme.background }]}>
            <Text style={[styles.weightLabel, { color: theme.text }]}>Goal Weight:</Text>
            <Text style={[styles.weightValue, { color: theme.text }]}>{goalWeight} lbs</Text>
          </View>
          <View style={[styles.weightItem, { backgroundColor: theme.background }]}>
            <Text style={[styles.weightLabel, { color: theme.text }]}>Change Since Start:</Text>
            <Text style={[styles.weightValue, { color: weightChangeSinceStart <= 0 ? 'green' : 'red' }]}>
              {weightChangeSinceStart} lbs
            </Text>
          </View>
          <View style={[styles.weightItem, { backgroundColor: theme.background }]}>
            <Text style={[styles.weightLabel, { color: theme.text }]}>Change Since Last Weigh-In:</Text>
            <Text style={[styles.weightValue, { color: weightChangeSinceLast <= 0 ? 'green' : 'red' }]}>
              {weightChangeSinceLast} lbs
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.viewHistoryButton, { backgroundColor: theme.touchableBackground }]}
            onPress={() => navigation.navigate('WeightHistory')}
          >
            <Text style={[styles.viewHistoryText, { color: theme.primary }]}>View Weight History Chart</Text>
          </TouchableOpacity>
        </View>

        {/* Diet Plan Section */}
        <View style={[styles.dietPlanSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Diet Plan</Text>
          {currentDietPlan ? (
            <>
              <View style={[styles.dietPlanOverview, { backgroundColor: theme.background }]}>
                <Text style={[styles.dietPlanLabel, { color: theme.text }]}>Calories:</Text>
                <Text style={[styles.dietPlanValue, { color: theme.text }]}>{currentDietPlan.calorieTarget} kcal</Text>
                <Text style={[styles.dietPlanLabel, { color: theme.text }]}>Protein:</Text>
                <Text style={[styles.dietPlanValue, { color: theme.text }]}>{currentDietPlan.proteinTarget}g</Text>
                <Text style={[styles.dietPlanLabel, { color: theme.text }]}>Carbs:</Text>
                <Text style={[styles.dietPlanValue, { color: theme.text }]}>{currentDietPlan.carbsTarget}g</Text>
                <Text style={[styles.dietPlanLabel, { color: theme.text }]}>Fat:</Text>
                <Text style={[styles.dietPlanValue, { color: theme.text }]}>{currentDietPlan.fatTarget}g</Text>
              </View>
              <TouchableOpacity
                style={[styles.viewDetailsButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => navigation.navigate('DietPlan', { dietPlan: currentDietPlan })}
              >
                <Text style={[styles.viewDetailsButtonText, { color: theme.buttonText }]}>View Details</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[styles.noAppointmentsText, { color: theme.text }]}>No diet plan assigned.</Text> // Or some other placeholder
          )}
          <TouchableOpacity
            style={[styles.viewHistoryButton, { backgroundColor: theme.touchableBackground }]}
            onPress={() => navigation.navigate('DietPlanHistory')}
          >
            <Text style={[styles.viewHistoryText, { color: theme.primary }]}>View Diet Plan History</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View style={[styles.appointmentsSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Appointments</Text>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <View key={appointment.id} style={[styles.appointmentItem, { backgroundColor: theme.background }]}>
                <View style={styles.appointmentDetails}>
                  <Text style={[styles.appointmentDate, { color: theme.text }]}>{formatDate(appointment.date_time)}</Text>
                  <Text style={[styles.appointmentTime, { color: theme.text }]}>{formatTime(appointment.date_time)}</Text>
                  <Text style={[styles.appointmentLocation, { color: theme.text }]}>{appointment.location}</Text>
                </View>
                <View style={[styles.appointmentActions, { backgroundColor: theme.cardBackground }]}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.touchableBackground }]}
                    onPress={() => handleReschedule(appointment.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.primary }]}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.touchableBackground }]}
                    onPress={() => handleCancel(appointment.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: 'red' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.touchableBackground }]}
                    onPress={() => addToCalendar(appointment)}
                  >
                    <Ionicons name='calendar-outline' size={24} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noAppointmentsText, { color: theme.text }]}>No upcoming appointments.</Text>
          )}
        </View>

        {/* Past Appointments */}
        <View style={[styles.appointmentsSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Appointments</Text>
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <View key={appointment.id} style={[styles.appointmentItem, { backgroundColor: theme.background }]}>
                <View style={styles.appointmentDetails}>
                  <Text style={[styles.appointmentDate, { color: theme.text }]}>{formatDate(appointment.date_time)}</Text>
                  <Text style={[styles.appointmentTime, { color: theme.text }]}>{formatTime(appointment.date_time)}</Text>
                  <Text style={[styles.appointmentLocation, { color: theme.text }]}>{appointment.location}</Text>
                  {appointment.notes && (
                    <Text style={[styles.appointmentNotes, { color: theme.text }]}>{appointment.notes}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noAppointmentsText, { color: theme.text }]}>No past appointments.</Text>
          )}
        </View>
        <View style={{ height: 30 }}></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageIcon: {
    padding: 5,
  },
  settingsButton: {
    padding: 5,
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
  headerText: {
    fontSize: 20,
    fontFamily: 'sans-serif-medium',
  },
  settingsPlaceholder: {
    width: 34,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center'
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
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center'
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
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
  },
  viewDetailsButtonText: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center'
  },
  viewHistoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  settingItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    marginLeft: 10
  }
});

export default ProfileScreen;