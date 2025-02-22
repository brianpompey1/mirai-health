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
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation();

  const toggleAddModal = useCallback(() => {
    setAddModalVisible((prev) => !prev);
  }, []);

  const handleAddExercise = useCallback(() => {
    navigation.navigate("Profile", {
      screen: "AddExercise",
      params: {closeModal: toggleAddModal}
    });
    toggleAddModal();
  }, [navigation]);

  const handleAddFood = useCallback(() => {
    navigation.navigate("AddFood", {closeModal: toggleAddModal});
    toggleAddModal();
  }, [navigation]);

  const closeModal = useCallback(() => {
    setAddModalVisible(false);
  }, []);

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
          tabBarActiveTintColor: theme.tabBarActive,  // Use theme colors
          tabBarInactiveTintColor: theme.tabBarInactive, // Use theme colors
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
          initialParams={{ closeModal }}
        />
        <Tab.Screen
          name="Log"
          component={LogScreen}
          initialParams={{ closeModal }}
        />
        <Tab.Screen
          name="Add"
          component={() => null}
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
          initialParams={{ closeModal }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          initialParams={{ closeModal }}
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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ headerShown: true, title: 'Add Food' }} />
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