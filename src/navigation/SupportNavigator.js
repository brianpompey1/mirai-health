import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FAQScreen from '../screens/FAQScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const SupportStack = createNativeStackNavigator();

const SupportNavigator = () => {
  return (
    <SupportStack.Navigator initialRouteName="FAQ">
      <SupportStack.Screen name="FAQ" component={FAQScreen} />
      <SupportStack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <SupportStack.Screen name="Terms" component={TermsScreen} />
      <SupportStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </SupportStack.Navigator>
  );
};

export default SupportNavigator;