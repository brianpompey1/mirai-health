import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import RequestAppointmentScreen from '../screens/RequestAppointmentScreen';
import DietPlanScreen from '../screens/DietPlanScreen';
import DietPlanHistoryScreen from '../screens/DietPlanHistoryScreen';
import SupportNavigator from './SupportNavigator';
import RescheduleAppointmentScreen from '../screens/RescheduleAppointmentScreen';
import AddExerciseScreen from '../screens/AddExerciseScreen';
import WeightHistoryScreen from '../screens/WeightHistoryScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import MessageCenterScreen from '../screens/MessageCenterScreen';

const ProfileStack = createNativeStackNavigator();

const ProfileNavigator = () => {
  const { theme } = useTheme();

  const headerOptions = {
    headerStyle: {
      backgroundColor: theme.cardBackground,
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: theme.text,
    headerTitleStyle: {
      color: theme.text,
      fontFamily: 'sans-serif-medium',
    },
    headerBackTitleVisible: false,
    headerBackImage: () => (
      <Ionicons name="chevron-back" size={24} color={theme.primary} style={{ marginLeft: 10 }} />
    ),
  };

  return (
    <ProfileStack.Navigator screenOptions={headerOptions}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          title: "Edit Profile",
          presentation: 'modal'
        }}
      />
      <ProfileStack.Screen 
        name="RequestAppointment" 
        component={RequestAppointmentScreen}
        options={{ 
          title: "Request Appointment",
          presentation: 'modal'
        }}
      />
      <ProfileStack.Screen 
        name="DietPlan" 
        component={DietPlanScreen}
        options={{ title: "Diet Plan Details" }}
      />
      <ProfileStack.Screen 
        name="DietPlanHistory" 
        component={DietPlanHistoryScreen}
        options={{ title: "Diet Plan History" }}
      />
      <ProfileStack.Screen 
        name="Support" 
        component={SupportNavigator} 
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="RescheduleAppointment" 
        component={RescheduleAppointmentScreen}
        options={{ 
          title: "Reschedule Appointment",
          presentation: 'modal'
        }}
      />
      <ProfileStack.Screen 
        name="AddExercise" 
        component={AddExerciseScreen}
        options={{ title: "Add Exercise" }}
      />
      <ProfileStack.Screen 
        name="WeightHistory" 
        component={WeightHistoryScreen}
        options={{ title: "Weight History" }}
      />
      <ProfileStack.Screen 
        name="ThemeSettings" 
        component={ThemeSettingsScreen}
        options={{
          title: 'Theme Settings',
          headerBackTitle: 'Back'
        }}
      />
      <ProfileStack.Screen
        name="MessageCenter"
        component={MessageCenterScreen}
        options={{
          title: 'Message Center',
          headerStyle: {
            backgroundColor: theme.cardBackground,
          },
          headerTintColor: theme.text,
        }}
      />
    </ProfileStack.Navigator>
  );
};

export { ProfileNavigator };
export default ProfileNavigator;