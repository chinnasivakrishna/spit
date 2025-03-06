import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faCreditCard, faPiggyBank, faUser } from '@fortawesome/free-solid-svg-icons';
// For outline icons, import from free-regular-svg-icons instead
// import { faHome, faCreditCard, faPiggyBank, faUser } from '@fortawesome/free-regular-svg-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 10,
            shadowColor: 'transparent',
          },
          default: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 10,
            shadowColor: 'transparent',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faHome} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ExpensesScreen"
        options={{
          title: 'Expense',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faCreditCard} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SavingsScreen"
        options={{
          title: 'Savings',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faPiggyBank} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faUser} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
