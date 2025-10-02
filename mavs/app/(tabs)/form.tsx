import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';

export default function FormScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Member form state
  const [memberForm, setMemberForm] = useState({
    family_share: '',
    name: '',
    address: '',
    email: '',
    mobile_no: '',
    service_address: '',
    current_city: '',
    current_state: '',
    current_address: '',
    age: '',
    swa_gotra: '',
    mame_gotra: '',
    home_town_address: '',
    qualification: '',
    specialization: '',
    other_info: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setMemberForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Show action sheet for image source selection
      Alert.alert(
        'Select Image',
        'Choose how you want to add your photo',
        [
          { text: 'Camera', onPress: openCamera },
          { text: 'Gallery', onPress: openGallery },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const openCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const validateForm = () => {
    if (!memberForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }

    if (memberForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (memberForm.age && (parseInt(memberForm.age) < 0 || parseInt(memberForm.age) > 150)) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }

    if (memberForm.mobile_no && !/^\d{10,15}$/.test(memberForm.mobile_no.replace(/[\s\-\(\)]/g, ''))) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare member data and clean up empty values
      const memberData: any = {};
      
      // Only add non-empty fields to avoid sending undefined
      Object.keys(memberForm).forEach(key => {
        const value = memberForm[key as keyof typeof memberForm];
        if (value && value.trim() !== '') {
          if (key === 'age') {
            memberData[key] = parseInt(value);
          } else {
            memberData[key] = value;
          }
        }
      });

      // Use createWithImage if image is selected, otherwise use regular create
      const response = selectedImage 
        ? await apiService.members.createWithImage(memberData, selectedImage, token || undefined)
        : await apiService.members.create(memberData, token || undefined);
      
      if (response.success) {
        Alert.alert(
          'Success!',
          'Member registration submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setMemberForm({
                  family_share: '',
                  name: '',
                  address: '',
                  email: '',
                  mobile_no: '',
                  service_address: '',
                  current_city: '',
                  current_state: '',
                  current_address: '',
                  age: '',
                  swa_gotra: '',
                  mame_gotra: '',
                  home_town_address: '',
                  qualification: '',
                  specialization: '',
                  other_info: '',
                });
                setSelectedImage(null);
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit member registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title">Member Registration</ThemedText>
            <ThemedText type="subtitle">Please fill out your information to register as a member</ThemedText>
          </View>

          <View style={styles.formContainer}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              {/* Profile Image Section */}
              <Text style={styles.label}>Profile Image</Text>
              <View style={styles.imageContainer}>
                {selectedImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.profileImage} />
                    <View style={styles.imageButtons}>
                      <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                        <Text style={styles.changeImageText}>Change Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                        <Text style={styles.removeImageText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Text style={styles.imagePickerText}>📷</Text>
                    <Text style={styles.imagePickerLabel}>Add Profile Photo</Text>
                    <Text style={styles.imagePickerSubtext}>Tap to select from camera or gallery</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={memberForm.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter your full name"
              />

              <Text style={styles.label}>Family Share</Text>
              <TextInput
                style={styles.input}
                value={memberForm.family_share}
                onChangeText={(text) => handleInputChange('family_share', text)}
                placeholder="Family share details"
              />

              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={memberForm.age}
                onChangeText={(text) => handleInputChange('age', text)}
                placeholder="Your age"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={memberForm.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={memberForm.mobile_no}
                onChangeText={(text) => handleInputChange('mobile_no', text)}
                placeholder="Your mobile number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Address Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address Information</Text>
              
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={memberForm.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Your permanent address"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Current City</Text>
              <TextInput
                style={styles.input}
                value={memberForm.current_city}
                onChangeText={(text) => handleInputChange('current_city', text)}
                placeholder="Your current city"
              />

              <Text style={styles.label}>Current State</Text>
              <TextInput
                style={styles.input}
                value={memberForm.current_state}
                onChangeText={(text) => handleInputChange('current_state', text)}
                placeholder="Your current state"
              />

              <Text style={styles.label}>Current Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={memberForm.current_address}
                onChangeText={(text) => handleInputChange('current_address', text)}
                placeholder="Your current address"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Service Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={memberForm.service_address}
                onChangeText={(text) => handleInputChange('service_address', text)}
                placeholder="Service/work address"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Home Town Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={memberForm.home_town_address}
                onChangeText={(text) => handleInputChange('home_town_address', text)}
                placeholder="Your home town address"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <Text style={styles.label}>Swa Gotra</Text>
              <TextInput
                style={styles.input}
                value={memberForm.swa_gotra}
                onChangeText={(text) => handleInputChange('swa_gotra', text)}
                placeholder="Your gotra"
              />

              <Text style={styles.label}>Mame Gotra</Text>
              <TextInput
                style={styles.input}
                value={memberForm.mame_gotra}
                onChangeText={(text) => handleInputChange('mame_gotra', text)}
                placeholder="Mother's gotra"
              />

              <Text style={styles.label}>Qualification</Text>
              <TextInput
                style={styles.input}
                value={memberForm.qualification}
                onChangeText={(text) => handleInputChange('qualification', text)}
                placeholder="Your educational qualification"
              />

              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.input}
                value={memberForm.specialization}
                onChangeText={(text) => handleInputChange('specialization', text)}
                placeholder="Your area of specialization"
              />

              <Text style={styles.label}>Other Information</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={memberForm.other_info}
                onChangeText={(text) => handleInputChange('other_info', text)}
                placeholder="Any additional information you'd like to share"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    paddingTop: 20,
  },
  formContainer: {
    gap: 20,
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginBottom: 15,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imagePickerText: {
    fontSize: 40,
    marginBottom: 10,
  },
  imagePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  changeImageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
