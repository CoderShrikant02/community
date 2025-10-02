import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isAdmin } = useAuth();

  // Only show tabs if user is authenticated
  if (!user) {
    return null; // This will prevent the tab layout from rendering
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      {/* Donation tab - visible to all authenticated users */}
      <Tabs.Screen
        name="donation"
        options={{
          title: 'Donate',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      
      {/* Form tab - only visible to authenticated users */}
      <Tabs.Screen
        name="form"
        options={{
          title: 'Form',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      
      {/* Submissions tab - visible to all authenticated users */}
      <Tabs.Screen
        name="submissions"
        options={{
          title: 'Submissions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />
      
      {/* Admin tab - only visible to admin users */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.badge.key.fill" color={color} />,
          href: isAdmin() ? undefined : null, // Hide tab by setting href to null
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
