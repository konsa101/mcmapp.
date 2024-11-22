import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import auth from './auth';
import form from './form';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    
      <Stack.Navigator initialRouteName="auth">
        <Stack.Screen name="auth" component={auth} options={{ headerShown: false }} />
        <Stack.Screen name="form" component={form}/>
      </Stack.Navigator>

  );
}
