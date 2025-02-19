import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ProfileNavigator from './ProfileNavigator'; //
import { Ionicons } from '@expo/vector-icons';
import AddActionModal from '../components/AddActionModal';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ onPress, children }) => (
    <TouchableOpacity
        style={{
            top: -30,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow,
        }}
        onPress={onPress}
    >
        <View style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#007AFF',
            justifyContent: 'center', // Center the icon horizontally
            alignItems: 'center',     // Center the icon vertically
        }}>
            {children}
        </View>
    </TouchableOpacity>
);

const AddButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.addButton}
    onPress={onPress}
  >
    <Ionicons name="add-circle" size={32} color="white" />
  </TouchableOpacity>
);

const AppNavigator = () => {
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleAddExercise = () => {
        // Placeholder logic for adding exercise
        toggleModal();
    };

    const handleAddFood = () => {
        // Placeholder logic for adding food
        toggleModal();
    };

    const handleAddWater = () => {
        // Placeholder logic for adding water
        toggleModal();
    };

    return (
      <>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Log') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Recommendations') {
                iconName = focused ? 'bulb' : 'bulb-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Log" component={LogScreen} />
          <Tab.Screen
            name="Add"
            options={{
              tabBarIcon: () => (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={toggleModal}
                >
                  <Ionicons name="add-circle" size={32} color="white" />
                </TouchableOpacity>
              ),
            }}
          >
            {() => null}
          </Tab.Screen>
          <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
          <Tab.Screen
            name="Profile"
            component={ProfileNavigator}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>

        <AddActionModal
          isVisible={isModalVisible}
          onClose={toggleModal}
          onAddExercise={handleAddExercise}
          onAddFood={handleAddFood}
          onAddWater={handleAddWater}
        />
      </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    addButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }
});

export default AppNavigator;