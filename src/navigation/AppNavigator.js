// src/navigation/AppNavigator.js
import React, { useState, useCallback } from 'react'; // Import useCallback
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ProfileNavigator from './ProfileNavigator';
import { Ionicons } from '@expo/vector-icons';
import AddActionModal from '../components/AddActionModal';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ onPress, children }) => (
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
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

const AppNavigator = () => {
  const [isAddModalVisible, setAddModalVisible] = useState(false); // Modal visibility state

  // Use useCallback to prevent unnecessary re-renders of the function
  const toggleAddModal = useCallback(() => {
    setAddModalVisible((prev) => !prev);
  }, []);

    const handleAddExercise = () => {
        //Placeholder logic, add the exercise
        toggleAddModal();
    }
    const handleAddFood = () => {
        //Placeholder logic, add food
        toggleAddModal();
    }
    const handleAddWater = () => {
      //Placeholder logic
      toggleAddModal();
    }

  const closeModal = useCallback(() => { // Function to close the modal
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
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarShowLabel: false,
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          initialParams={{ closeModal }} // Pass closeModal down
        />
        <Tab.Screen
          name="Log"
          component={LogScreen}
          initialParams={{ closeModal }} // Pass closeModal down
        />
        <Tab.Screen
          name="Add"
          component={() => null} // Keep this empty
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
          initialParams={{ closeModal }} // Pass closeModal down
        />
        <Tab.Screen
            name="Profile"
            component={ProfileNavigator}
            initialParams={{ closeModal }} // Pass closeModal down
        />
      </Tab.Navigator>
      {/* Conditionally render the modal */}
      {isAddModalVisible && (
        <AddActionModal
          isVisible={isAddModalVisible}
          onClose={toggleAddModal}
          onAddExercise={handleAddExercise}
          onAddFood={handleAddFood}
          onAddWater={handleAddWater}
        />
      )}
    </>
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