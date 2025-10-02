import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { apiService, Member } from '@/services/api';

export default function SubmissionsScreen() {
  const { user, token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      if (!token) return;
      
      // Try to get all members (should work for all authenticated users based on backend)
      const response = await apiService.members.getAll(token);
      
      if (response.success && response.data) {
        const sortedMembers = response.data.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        setMembers(sortedMembers);
        setFilteredMembers(sortedMembers);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      Alert.alert('Error', error.message || 'Failed to fetch member submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.name?.toLowerCase().includes(query.toLowerCase()) ||
        member.email?.toLowerCase().includes(query.toLowerCase()) ||
        member.mobile_no?.includes(query) ||
        member.current_city?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  };

  const handleMemberPress = (member: Member) => {
    setSelectedMember(member);
    setModalVisible(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    if (token) {
      fetchMembers();
    }
  }, [token, fetchMembers]);

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          Please log in to view submissions.
        </ThemedText>
      </ThemedView>
    );
  }

  const MemberCard = ({ member }: { member: Member }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => handleMemberPress(member)}
    >
      <View style={styles.memberHeader}>
        <View style={styles.memberAvatar}>
          {member.profile_image ? (
            <Image source={{ uri: member.profile_image }} style={styles.avatarImage} />
          ) : (
            <IconSymbol name="person.fill" size={24} color="#666" />
          )}
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name || 'No Name'}</Text>
          <Text style={styles.memberEmail}>{member.email || 'No Email'}</Text>
          <Text style={styles.memberDate}>{formatDate(member.created_at)}</Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color="#666" />
      </View>
      
      <View style={styles.memberDetails}>
        <Text style={styles.memberDetail}>
          📱 {member.mobile_no || 'No Phone'}
        </Text>
        <Text style={styles.memberDetail}>
          🏙️ {member.current_city || 'No City'}
        </Text>
        {member.age && (
          <Text style={styles.memberDetail}>
            🎂 Age: {member.age}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const MemberDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Member Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <IconSymbol name="xmark" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {selectedMember && (
              <View style={styles.detailsContainer}>
                {/* Profile Image */}
                {selectedMember.profile_image && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: selectedMember.profile_image }} 
                      style={styles.profileImage} 
                    />
                  </View>
                )}
                
                {/* Basic Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  <DetailRow label="Full Name" value={selectedMember.name} />
                  <DetailRow label="Email" value={selectedMember.email} />
                  <DetailRow label="Mobile" value={selectedMember.mobile_no} />
                  <DetailRow label="Age" value={selectedMember.age?.toString()} />
                  <DetailRow label="Family Share" value={selectedMember.family_share} />
                </View>

                {/* Address Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Address Information</Text>
                  <DetailRow label="Address" value={selectedMember.address} />
                  <DetailRow label="Current City" value={selectedMember.current_city} />
                  <DetailRow label="Current State" value={selectedMember.current_state} />
                  <DetailRow label="Current Address" value={selectedMember.current_address} />
                  <DetailRow label="Service Address" value={selectedMember.service_address} />
                  <DetailRow label="Home Town Address" value={selectedMember.home_town_address} />
                </View>

                {/* Additional Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                  <DetailRow label="Swa Gotra" value={selectedMember.swa_gotra} />
                  <DetailRow label="Mame Gotra" value={selectedMember.mame_gotra} />
                  <DetailRow label="Qualification" value={selectedMember.qualification} />
                  <DetailRow label="Specialization" value={selectedMember.specialization} />
                  <DetailRow label="Other Info" value={selectedMember.other_info} />
                  <DetailRow label="Submitted On" value={formatDate(selectedMember.created_at)} />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const DetailRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">
          All Submissions
        </ThemedText>
        <ThemedText type="subtitle">
          {filteredMembers.length} of {members.length} member registrations
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, phone, or city..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Members List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading submissions...</ThemedText>
        ) : filteredMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              {searchQuery 
                ? 'No submissions found matching your search' 
                : 'No form submissions yet'
              }
            </ThemedText>
            {!searchQuery && (
              <ThemedText style={styles.emptySubText}>
                Be the first to submit a member registration form!
              </ThemedText>
            )}
          </View>
        ) : (
          <View style={styles.membersList}>
            {filteredMembers.map((member, index) => (
              <MemberCard key={member.id || index} member={member} />
            ))}
          </View>
        )}
      </ScrollView>

      <MemberDetailModal />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#FF6B6B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  membersList: {
    padding: 20,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberDate: {
    fontSize: 12,
    color: '#999',
  },
  memberDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberDetail: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
});