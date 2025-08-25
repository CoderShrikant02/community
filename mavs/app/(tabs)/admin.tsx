import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { apiService, User, Member, MemberStats, downloadMembersExcelMobile } from '@/services/api';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminScreen() {
  const { user, token, isAdmin } = useAuth();
  const colorScheme = useColorScheme();
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentSignups: 0,
  });
  const [memberStats, setMemberStats] = useState<MemberStats>({
    total: 0,
    recent: 0,
    byCity: [],
    byAgeGroup: [],
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      return;
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      if (!token) return;
      
      const response = await apiService.auth.getAllUsers(token);
      if (response.success && response.data) {
        setUsers(response.data);
        calculateStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', error.message || 'Failed to fetch users');
    }
  };

  const fetchMembers = async () => {
    try {
      if (!token) return;
      
      const [membersResponse, statsResponse] = await Promise.all([
        apiService.members.getAll(token),
        apiService.members.getStats(token)
      ]);
      
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setMemberStats(statsResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      Alert.alert('Error', error.message || 'Failed to fetch member data');
    }
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchUsers(), fetchMembers()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (userList: User[]) => {
    const totalUsers = userList.length;
    const adminUsers = userList.filter(u => u.role === 'admin').length;
    const regularUsers = userList.filter(u => u.role === 'user').length;
    
    // Calculate recent signups (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSignups = userList.filter(u => 
      new Date(u.created_at) > weekAgo
    ).length;

    setStats({
      totalUsers,
      adminUsers,
      regularUsers,
      recentSignups,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const handleDownloadExcel = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not available');
      return;
    }

    try {
      setDownloading(true);
      
      Alert.alert(
        'Download Started',
        'Your Excel file is being prepared. This may take a moment...',
        [{ text: 'OK' }]
      );

      // Use the mobile-specific download function
      const filePath = await downloadMembersExcelMobile(token);
      
      Alert.alert(
        'Export Complete',
        `Members data exported successfully!\nTotal records: ${memberStats.total}\nFile saved and ready to share.`,
        [
          { text: 'OK', style: 'default' }
        ]
      );

    } catch (error: any) {
      console.error('Error downloading Excel:', error);
      Alert.alert(
        'Download Failed', 
        error.message || 'Failed to download members data. Please try again.'
      );
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (isAdmin() && token) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: color + '20' }]}>
      <View style={styles.statHeader}>
        <IconSymbol name={icon as any} size={24} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (!isAdmin()) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          Access Denied. Admin privileges required.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Admin Dashboard</ThemedText>
          <ThemedText type="subtitle">Welcome back, {user?.full_name}</ThemedText>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="person.fill"
            color={Colors[colorScheme ?? 'light'].tint}
          />
          <StatCard
            title="Total Members"
            value={memberStats.total}
            icon="person.fill"
            color="#34C759"
          />
          <StatCard
            title="Admin Users"
            value={stats.adminUsers}
            icon="person.badge.key.fill"
            color="#FF6B6B"
          />
          <StatCard
            title="Recent Members"
            value={memberStats.recent}
            icon="person.fill"
            color="#45B7D1"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}
            onPress={() => {
              Alert.alert(
                'Members Overview',
                `Total Members: ${memberStats.total}\nRecent (30 days): ${memberStats.recent}\n\nTop Cities:\n${memberStats.byCity.slice(0, 3).map(city => `• ${city.current_city}: ${city.count}`).join('\n')}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <IconSymbol name="person.fill" size={20} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
              View Members ({memberStats.total})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#28a745' + '20' }]}
            onPress={handleDownloadExcel}
            disabled={downloading}
          >
            <IconSymbol name="arrow.down.doc.fill" size={20} color="#28a745" />
            <Text style={[styles.actionButtonText, { color: '#28a745' }]}>
              {downloading ? 'Preparing...' : 'Download Excel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4ECDC4' + '20' }]}
            onPress={() => Alert.alert('Feature Coming Soon', 'Donation analytics will be available soon.')}
          >
            <IconSymbol name="heart.fill" size={20} color="#4ECDC4" />
            <Text style={[styles.actionButtonText, { color: '#4ECDC4' }]}>
              View Donations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF6B6B' + '20' }]}
            onPress={() => Alert.alert('Feature Coming Soon', 'System settings will be available soon.')}
          >
            <IconSymbol name="chevron.right" size={20} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>
              System Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Users
          </ThemedText>
          
          {loading ? (
            <ThemedText>Loading users...</ThemedText>
          ) : (
            <View style={styles.usersList}>
              {users.slice(0, 5).map((userItem) => (
                <View key={userItem.user_id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={[
                      styles.roleIndicator, 
                      { backgroundColor: userItem.role === 'admin' ? '#FF6B6B' : '#4ECDC4' }
                    ]} />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{userItem.full_name}</Text>
                      <Text style={styles.userEmail}>{userItem.email}</Text>
                    </View>
                  </View>
                  <View style={styles.userMeta}>
                    <Text style={styles.userRole}>{userItem.role}</Text>
                    <Text style={styles.userDate}>{formatDate(userItem.created_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#FF6B6B',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  usersList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userMeta: {
    alignItems: 'flex-end',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
  },
  userDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
