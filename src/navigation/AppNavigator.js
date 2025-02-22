// src/navigation/AppNavigator.js
import React, { useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ProfileNavigator from './ProfileNavigator';
import AddFoodScreen from '../screens/AddFoodScreen';
import { Ionicons } from '@expo/vector-icons';
import AddActionModal from '../components/AddActionModal';
import { useTheme } from '../contexts/ThemeContext';
import EditProfileScreen from '../screens/EditProfileScreen';
import RequestAppointmentScreen from '../screens/RequestAppointmentScreen';
import RescheduleAppointmentScreen from '../screens/RescheduleAppointmentScreen';
import WeightHistoryScreen from '../screens/WeightHistoryScreen';
import DietPlanScreen from '../screens/DietPlanScreen';
import DietPlanHistoryScreen from '../screens/DietPlanHistoryScreen';
import AuthScreen from '../screens/AuthScreen';
import { useModal } from '../contexts/ModalContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBarButton = ({ onPress, children }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={{
        top: -5,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.shadow,
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 35,
          backgroundColor: theme.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

const TabNavigator = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { isAddModalVisible, toggleAddModal } = useModal();

  const handleAddExercise = useCallback(() => {
    navigation.navigate("Profile", {
      screen: "ProfileHome"
    });
    toggleAddModal();
  }, [navigation, toggleAddModal]);

  const handleAddFood = useCallback(() => {
    navigation.navigate("AddFood");
    toggleAddModal();
  }, [navigation, toggleAddModal]);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Log') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Recommendations') {
              iconName = focused ? 'bulb' : 'bulb-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarStyle: {
            backgroundColor: theme.cardBackground,
            borderTopColor: theme.border,
            height: 70,
            paddingBottom: 8,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0
          },
          headerShown: false,
          tabBarShowLabel: false,
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
        />
        <Tab.Screen
          name="Log"
          component={LogScreen}
        />
        <Tab.Screen
          name="Add"
          children={() => null}
          options={{
            tabBarIcon: () => (
              <Ionicons name="add-sharp" size={28} color="white" />
            ),
            tabBarButton: (props) => (
              <CustomTabBarButton {...props} onPress={toggleAddModal} />
            ),
          }}
        />
        <Tab.Screen
          name="Recommendations"
          component={RecommendationsScreen}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
        />
      </Tab.Navigator>
      {isAddModalVisible && (
        <AddActionModal
          isVisible={isAddModalVisible}
          onClose={toggleAddModal}
          onAddExercise={handleAddExercise}
          onAddFood={handleAddFood}
        />
      )}
    </>
  );
};

const AppNavigator = () => {
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="AddFood" 
        component={AddFoodScreen} 
        options={{ 
          headerShown: true, 
          title: 'Add Food',
          ...headerOptions
        }} 
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: "Edit Profile",
          presentation: 'modal',
          ...headerOptions
        }}
      />
      <Stack.Screen
        name="RequestAppointment"
        component={RequestAppointmentScreen}
        options={{
          headerShown: true,
          title: "Request Appointment",
          presentation: 'modal',
          ...headerOptions
        }}
      />
      <Stack.Screen
        name="RescheduleAppointment"
        component={RescheduleAppointmentScreen}
        options={{
          headerShown: true,
          title: "Reschedule Appointment",
          presentation: 'modal',
          ...headerOptions
        }}
      />
      <Stack.Screen
        name="WeightHistory"
        component={WeightHistoryScreen}
        options={{
          headerShown: true,
          title: "Weight History",
          ...headerOptions
        }}
      />
      <Stack.Screen
        name="DietPlan"
        component={DietPlanScreen}
        options={{
          headerShown: true,
          title: "Diet Plan Details",
          ...headerOptions
        }}
      />
      <Stack.Screen
        name="DietPlanHistory"
        component={DietPlanHistoryScreen}
        options={{
          headerShown: true,
          title: "Diet Plan History",
          ...headerOptions
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

export default AppNavigator;