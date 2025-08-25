import { StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const [backendStatus, setBackendStatus] = useState<string>('Testing...');
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const testConnection = async () => {
    try {
      await apiService.testConnection();
      setBackendStatus('✅ Connected');
    } catch (err) {
      console.error('Connection failed:', err);
      setBackendStatus('❌ Failed');
    }
  };

  const navigateToDonation = () => {
    router.push('/donation' as any);
  };

  const handleFormPress = () => {
    router.push('/form' as any);
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <ThemedView style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>MAVS</ThemedText>
        </ThemedView>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to MAVS</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.container}>
        {user ? (
          <>
            {/* <ThemedView style={styles.userCard}>
              <ThemedText style={styles.userName}>{user.full_name}</ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              <ThemedText style={styles.userRole}>
                {isAdmin() ? '👑 Admin' : '👤 User'}
              </ThemedText>
            </ThemedView> */}

            <ThemedView style={styles.donationCard}>
              <ThemedText style={styles.sectionTitle}>Make a Difference</ThemedText>
              <ThemedText style={styles.donationText}>
                Support our cause with a donation
              </ThemedText>
              <TouchableOpacity style={styles.donateButton} onPress={navigateToDonation}>
                <ThemedText style={styles.buttonText}>💖 Donate Now</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {/* Form Button Section */}
            <ThemedView style={styles.formCard}>
              <ThemedText style={styles.sectionTitle}>Get in Touch</ThemedText>
              <ThemedText style={styles.formText}>
                Have questions or feedback? Contact us!
              </ThemedText>
              <TouchableOpacity style={styles.formButton} onPress={handleFormPress}>
                <ThemedText style={styles.buttonText}>📝 FORM</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {/* <ThemedView style={styles.statusSection}>
              <ThemedText style={styles.sectionTitle}>System Status</ThemedText>
              <ThemedText style={styles.statusText}>Backend: {backendStatus}</ThemedText>
            </ThemedView> */}
          </>
        ) : (
          <>
            <ThemedView style={styles.guestCard}>
              <ThemedText style={styles.guestTitle}>Hello!</ThemedText>
              <ThemedText style={styles.guestText}>
                Please login to access your account
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.donationCard}>
              <ThemedText style={styles.sectionTitle}>Support Our Mission</ThemedText>
              <ThemedText style={styles.donationText}>
                Help us make a positive impact in the community
              </ThemedText>
              <TouchableOpacity style={styles.donateButton} onPress={navigateToDonation}>
                <ThemedText style={styles.buttonText}>💖 Learn More & Donate</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        )}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  container: {
    gap: 20,
  },
  userCard: {
    padding: 20,
    backgroundColor: 'rgba(161, 206, 220, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  adminSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminText: {
    fontSize: 14,
    opacity: 0.8,
  },
  guestCard: {
    padding: 20,
    backgroundColor: 'rgba(161, 206, 220, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  guestText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  statusSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    gap: 12,
  },
  statusText: {
    fontSize: 16,
  },
  donationCard: {
    padding: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  donationText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  formCard: {
    padding: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  formText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  donateButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  formButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
