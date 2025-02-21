import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import RequestAppointmentScreen from '../screens/RequestAppointmentScreen';
import DietPlanScreen from '../screens/DietPlanScreen'; // Import
import DietPlanHistoryScreen from '../screens/DietPlanHistoryScreen'; // Import
import SupportNavigator from './SupportNavigator'; // Import
import RescheduleAppointmentScreen from '../screens/RescheduleAppointmentScreen'; // Import
import AddExerciseScreen from '../screens/AddExerciseScreen'; //Import



const ProfileStack = createNativeStackNavigator();

const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }} // Hide header on main profile
      />
      <ProfileStack.Screen name="Settings" component={SettingsScreen}  />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="RequestAppointment" component={RequestAppointmentScreen} />
      <ProfileStack.Screen name="DietPlan" component={DietPlanScreen} />
      <ProfileStack.Screen name="DietPlanHistory" component={DietPlanHistoryScreen} />
      <ProfileStack.Screen name="Support" component={SupportNavigator} options={{headerShown: false}}/>
      <ProfileStack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} />
      <ProfileStack.Screen name="AddExercise" component={AddExerciseScreen} />
    </ProfileStack.Navigator>
  );
};

export { ProfileNavigator };
export default ProfileNavigator;