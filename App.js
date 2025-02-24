// App.js
import React from 'react';
import { View, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ModalProvider } from './src/contexts/ModalContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <ModalProvider>
              <AppContent />
            </ModalProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
  );
}