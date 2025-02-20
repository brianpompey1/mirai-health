import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen'; // Your combined Auth Screen
// Import other auth-related screens here (e.g., ForgotPasswordScreen)

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
      {/* Add other auth screens here:
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      */}
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;