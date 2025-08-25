import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              router.replace('/login' as any);
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Logout failed. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const navigateToLogin = () => {
    router.replace('/login' as any);
  };

  if (!user) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <ThemedView style={styles.headerContainer}>
            <ThemedText style={styles.headerTitle}>Profile</ThemedText>
          </ThemedView>
        }
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.title}>Not Logged In</ThemedText>
            <ThemedText style={styles.subtitle}>
              Please login to view your profile
            </ThemedText>
            <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
              <ThemedText style={styles.buttonText}>Login</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <ThemedView style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </ThemedView>
      }
    >
      <ThemedView style={styles.container}>
        {/* Profile Information */}
        <ThemedView style={styles.card}>
          <ThemedText style={styles.title}>Profile Information</ThemedText>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.label}>Full Name:</ThemedText>
            <ThemedText style={styles.value}>{user.full_name}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.label}>Email:</ThemedText>
            <ThemedText style={styles.value}>{user.email}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.label}>Role:</ThemedText>
            <ThemedView style={styles.roleContainer}>
              <ThemedText style={[styles.value, styles.roleText]}>
                {isAdmin() ? '👑 Administrator' : '👤 User'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.label}>Member Since:</ThemedText>
            <ThemedText style={styles.value}>
              {new Date(user.created_at).toLocaleDateString()}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.label}>User ID:</ThemedText>
            <ThemedText style={styles.value}>#{user.user_id}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Admin Section */}
        {isAdmin() && (
          <ThemedView style={styles.adminCard}>
            <ThemedText style={styles.title}>Admin Privileges</ThemedText>
            <ThemedText style={styles.adminText}>
              ✅ Access to admin panel
            </ThemedText>
            <ThemedText style={styles.adminText}>
              ✅ User management
            </ThemedText>
            <ThemedText style={styles.adminText}>
              ✅ System administration
            </ThemedText>
          </ThemedView>
        )}

        {/* Account Actions */}
        <ThemedView style={styles.card}>
          <ThemedText style={styles.title}>Account Actions</ThemedText>
          
          <TouchableOpacity 
            style={[styles.logoutButton, isLoggingOut && styles.disabledButton]} 
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <ThemedText style={styles.buttonText}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A1CEDC',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    gap: 20,
    paddingBottom: 20,
  },
  card: {
    padding: 20,
    backgroundColor: 'rgba(161, 206, 220, 0.1)',
    borderRadius: 12,
    gap: 16,
  },
  adminCard: {
    padding: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
  roleContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  roleText: {
    fontWeight: 'bold',
  },
  adminText: {
    fontSize: 14,
    opacity: 0.8,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#FF3B30AA',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
