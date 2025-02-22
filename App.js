// App.js
import React, { useState, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen'; // Import AuthScreen
import { supabase } from './src/utils/supabase';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { View, Text } from 'react-native'; //For loading state
import AuthNavigator from './src/navigation/AuthNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const checkUser = async() => {
        setLoading(true);
        try {
            const {data: {user}} = await supabase.auth.getUser();
            setUser(user);
        } catch(error){
            console.error(error);
        } finally {
            setLoading(false)
        }
    }
    const authSubscription = supabase.auth.onAuthStateChange((event, session) => {
        //This is a listener, anytime anything changes with auth, it'll call this
        setUser(session?.user ?? null) //If there is a session, there is a user
    });
    checkUser(); //Make sure to call this once when it first loads
    return () => {
      authSubscription.data.subscription.unsubscribe(); //Unsubscribe so that there are no memory leaks
    }
  }, []);

  if(loading) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Loading...</Text>
        </View>
    )
  }
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}