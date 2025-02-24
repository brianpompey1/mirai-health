import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FAQScreen from '../screens/FAQScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import { useTheme } from '../contexts/ThemeContext';

const SupportStack = createNativeStackNavigator();

const SupportNavigator = () => {
  const { theme } = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.background,
    },
    headerTintColor: theme.text,
    headerTitleStyle: {
      color: theme.text,
    },
    headerShadowVisible: false,
  };
  
  return (
    <SupportStack.Navigator 
      initialRouteName="FAQ"
      screenOptions={screenOptions}
    >
      <SupportStack.Screen 
        name="FAQ" 
        component={FAQScreen}
        options={{
          title: "FAQ"
        }}
      />
      <SupportStack.Screen 
        name="ContactSupport" 
        component={ContactSupportScreen}
        options={{
          title: "Contact Support"
        }}
      />
      <SupportStack.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{
          title: "Terms of Service"
        }}
      />
      <SupportStack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{
          title: "Privacy Policy"
        }}
      />
    </SupportStack.Navigator>
  );
};

export default SupportNavigator;