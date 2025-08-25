import { StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';

export default function DonationScreen() {
  const { user } = useAuth();

  const copyUpiId = () => {
    // Note: Clipboard functionality would require @react-native-clipboard/clipboard
    // For now, we'll show an alert with the UPI ID
    Alert.alert(
      'UPI ID Copied!', 
      'UPI ID: 18717143002445@cnrb\n\nYou can now paste this in your UPI app to make a donation.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <ThemedView style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Donate</ThemedText>
        </ThemedView>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.welcomeCard}>
            <ThemedText style={styles.title}>Support Our Cause</ThemedText>
            <ThemedText style={styles.description}>
              Your generous donation helps us continue our mission and make a positive impact in the community. Every contribution, no matter the size, makes a difference.
            </ThemedText>
          </ThemedView>

          {!user && (
            <ThemedView style={styles.loginPrompt}>
              <ThemedText style={styles.promptText}>
                Please login to make a donation
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.qrCard}>
            <ThemedText style={styles.qrTitle}>Donate via QR Code</ThemedText>
            <ThemedText style={styles.qrDescription}>
              Scan the QR code below with your banking app or UPI app to make a donation
            </ThemedText>
            
<ThemedView style={styles.qrContainer}>
  <Image 
    source={require('@/assets/images/donation-qr.png')} 
    style={styles.qrImage}
    resizeMode="contain"
  />
</ThemedView>
            
            <ThemedText style={styles.qrInstructions}>
              1. Open your UPI app (PhonePe, Google Pay, Paytm, etc.)
            </ThemedText>
            <ThemedText style={styles.qrInstructions}>
              2. Scan the QR code above
            </ThemedText>
            <ThemedText style={styles.qrInstructions}>
              3. Enter your donation amount
            </ThemedText>
            <ThemedText style={styles.qrInstructions}>
              4. Complete the payment
            </ThemedText>
            
            <ThemedText style={styles.thankYouText}>
              Thank you for your generous support! 🙏
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.upiCard}>
            <ThemedText style={styles.upiTitle}>Direct UPI Transfer</ThemedText>
            <ThemedText style={styles.upiDescription}>
              You can also donate directly using our UPI ID
            </ThemedText>
            
            <ThemedView style={styles.upiContainer}>
              <ThemedText style={styles.upiLabel}>UPI ID:</ThemedText>
              <ThemedView style={styles.upiIdContainer}>
                <ThemedText style={styles.upiId}>18717143002445@cnrb</ThemedText>
                <TouchableOpacity style={styles.copyButton} onPress={copyUpiId}>
                  <ThemedText style={styles.copyButtonText}>Copy</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            
            <ThemedText style={styles.upiInstructions}>
              1. Open your UPI app
            </ThemedText>
            <ThemedText style={styles.upiInstructions}>
              2. Select Send Money or Pay to Contact
            </ThemedText>
            <ThemedText style={styles.upiInstructions}>
              3. Enter the UPI ID: 18717143002445@cnrb
            </ThemedText>
            <ThemedText style={styles.upiInstructions}>
              4. Enter your donation amount and complete payment
            </ThemedText>
          </ThemedView>
        
          
        </ThemedView>
      </ScrollView>
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
  welcomeCard: {
    padding: 20,
    backgroundColor: 'rgba(161, 206, 220, 0.1)',
    borderRadius: 12,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  loginPrompt: {
    padding: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 16,
    fontWeight: '600',
  },
  qrCard: {
    padding: 20,
    backgroundColor: 'rgba(161, 206, 220, 0.1)',
    borderRadius: 12,
    gap: 16,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  qrPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  qrSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  qrInstructions: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginVertical: 2,
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    color: '#34C759',
  },
  upiCard: {
    padding: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    gap: 16,
  },
  upiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  upiDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  upiContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  upiLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  upiIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  upiId: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  upiInstructions: {
    fontSize: 14,
    opacity: 0.7,
    marginVertical: 2,
  },
});
