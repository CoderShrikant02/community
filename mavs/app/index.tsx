import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading

    if (user) {
      // User is authenticated, navigate to tabs
      router.replace('/(tabs)');
    } else {
      // User is not authenticated, navigate to login
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show loading screen while determining authentication state
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#667eea' }}>
      <ActivityIndicator size="large" color="#white" />
    </View>
  );
}