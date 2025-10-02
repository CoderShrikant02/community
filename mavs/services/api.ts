import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Types for API responses and requests
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  total?: number;
}

// Member interface
export interface Member {
  id: number;
  user_id?: number;
  family_share?: string;
  name: string;
  address?: string;
  email?: string;
  mobile_no?: string;
  service_address?: string;
  current_city?: string;
  current_state?: string;
  current_address?: string;
  age?: number;
  swa_gotra?: string;
  mame_gotra?: string;
  home_town_address?: string;
  qualification?: string;
  specialization?: string;
  other_info?: string;
  profile_image?: string;
  created_at: string;
  user_full_name?: string;
  user_email?: string;
}

export interface MemberStats {
  total: number;
  recent: number;
  byCity: { current_city: string; count: number }[];
  byAgeGroup: { age_group: string; count: number }[];
}

// API Configuration
class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = this.getBaseURL();
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Determine the correct base URL based on the platform and environment
   */
  private getBaseURL(): string {
    if (__DEV__) {
      // Development environment
      if (Platform.OS === 'web') {
        return 'http://localhost:5000/api';
      } else if (Platform.OS === 'android') {
        // For Android emulator, use 10.0.2.2 or your actual IP
        const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
        if (debuggerHost) {
          return `http://${debuggerHost}:5000/api`;
        }
        return 'http://10.0.2.2:5000/api'; // Android emulator default
      } else if (Platform.OS === 'ios') {
        // For iOS simulator, localhost works
        return 'http://localhost:5000/api';
      }
    }
    
    // Production environment - replace with your actual Render URL
    // Example: return 'https://mavs-backend-abcd.onrender.com/api';
    return 'https://your-render-app-name.onrender.com/api';
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        // Token will be added per request when needed
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling common responses
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        
        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Token expired or invalid - could trigger logout
          console.log('🔒 Authentication failed');
        } else if (error.response?.status === 403) {
          console.log('🚫 Access forbidden');
        } else if (error.response?.status >= 500) {
          console.log('🔥 Server error');
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Add authorization header to request config
   */
  private addAuthHeader(token: string, config: AxiosRequestConfig = {}): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  /**
   * Generic GET request
   */
  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  private async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  private async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  private async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  /**
   * Test API connectivity
   */
  public async testConnection(): Promise<ApiResponse> {
    try {
      return await this.get('/test');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to connect to API');
    }
  }

  /**
   * Check API health
   */
  public async healthCheck(): Promise<ApiResponse> {
    try {
      return await this.get('/health');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  }

  /**
   * Authentication API methods
   */
  public auth = {
    /**
     * User login
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
      try {
        const response = await this.post<AuthResponse>('/auth/login', credentials);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        throw new Error(message);
      }
    },

    /**
     * User registration
     */
    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
      try {
        const response = await this.post<AuthResponse>('/auth/register', userData);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed';
        throw new Error(message);
      }
    },

    /**
     * Get user profile (requires authentication)
     */
    getProfile: async (token: string): Promise<ProfileResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ProfileResponse>('/auth/profile', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get profile';
        throw new Error(message);
      }
    },

    /**
     * Get all users (admin only)
     */
    getAllUsers: async (token: string): Promise<ApiResponse<User[]>> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ApiResponse<User[]>>('/auth/users', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get users';
        throw new Error(message);
      }
    },
  };

  /**
   * Member API methods
   */
  public members = {
    /**
     * Create a new member (anyone can create)
     */
    create: async (memberData: Omit<Member, 'id' | 'created_at' | 'user_full_name' | 'user_email'>, token?: string): Promise<ApiResponse<Member>> => {
      try {
        const config = token ? this.addAuthHeader(token) : {};
        const response = await this.post<ApiResponse<Member>>('/members', memberData, config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to create member';
        throw new Error(message);
      }
    },

    /**
     * Create a new member with image upload
     */
    createWithImage: async (memberData: Omit<Member, 'id' | 'created_at' | 'user_full_name' | 'user_email'>, imageUri?: string, token?: string): Promise<ApiResponse<Member>> => {
      try {
        const formData = new FormData();
        
        // Add all member data to FormData
        Object.keys(memberData).forEach(key => {
          const value = (memberData as any)[key];
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Add image if provided
        if (imageUri) {
          const filename = imageUri.split('/').pop() || 'image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append('profile_image', {
            uri: imageUri,
            name: filename,
            type: type,
          } as any);
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };

        const response = await this.api.post('/members', formData, config);
        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to create member with image';
        throw new Error(message);
      }
    },

    /**
     * Get all members (requires authentication)
     */
    getAll: async (token: string): Promise<ApiResponse<Member[]>> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ApiResponse<Member[]>>('/members', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get members';
        throw new Error(message);
      }
    },

    /**
     * Get member by ID
     */
    getById: async (token: string, id: number): Promise<ApiResponse<Member>> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ApiResponse<Member>>(`/members/${id}`, config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get member';
        throw new Error(message);
      }
    },

    /**
     * Get current user's members
     */
    getMyMembers: async (token: string): Promise<ApiResponse<Member[]>> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ApiResponse<Member[]>>('/members/my-members', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get your members';
        throw new Error(message);
      }
    },

    /**
     * Update member
     */
    update: async (token: string, id: number, memberData: Partial<Member>): Promise<ApiResponse<Member>> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.put<ApiResponse<Member>>(`/members/${id}`, memberData, config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to update member';
        throw new Error(message);
      }
    },

    /**
     * Delete member (admin only)
     */
    delete: async (token: string, id: number): Promise<ApiResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.delete<ApiResponse>(`/members/${id}`, config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to delete member';
        throw new Error(message);
      }
    },

    /**
     * Get member statistics (admin only)
     */
    getStats: async (token: string): Promise<ApiResponse<MemberStats>> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ApiResponse<MemberStats>>('/members/admin/stats', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get member statistics';
        throw new Error(message);
      }
    },

    /**
     * Export members data to Excel (admin only)
     */
    exportToExcel: async (token: string): Promise<Blob> => {
      try {
        const config = this.addAuthHeader(token, {
          responseType: 'blob' as const,
        });
        const response = await this.api.get('/members/admin/export-excel', config);
        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to export members data';
        throw new Error(message);
      }
    },
  };
  
  /**
   * Donation API methods (placeholder for future implementation)
   */
  public donations = {
    /**
     * Create a donation record
     */
    create: async (token: string, donationData: any): Promise<ApiResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.post<ApiResponse>('/donations', donationData, config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to create donation';
        throw new Error(message);
      }
    },

    /**
     * Get user's donation history
     */
    getHistory: async (token: string): Promise<ApiResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ApiResponse>('/donations/history', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get donation history';
        throw new Error(message);
      }
    },

    /**
     * Get donation statistics (admin only)
     */
    getStats: async (token: string): Promise<ApiResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.get<ApiResponse>('/donations/stats', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to get donation stats';
        throw new Error(message);
      }
    },
  };

  /**
   * Profile API methods (placeholder for future implementation)
   */
  public profile = {
    /**
     * Update user profile
     */
    update: async (token: string, profileData: Partial<User>): Promise<ApiResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.put<ApiResponse>('/profile', profileData, config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to update profile';
        throw new Error(message);
      }
    },

    /**
     * Change password
     */
    changePassword: async (token: string, passwordData: {
      currentPassword: string;
      newPassword: string;
    }): Promise<ApiResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.put<ApiResponse>('/profile/password', passwordData, config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to change password';
        throw new Error(message);
      }
    },

    /**
     * Delete user account
     */
    deleteAccount: async (token: string): Promise<ApiResponse> => {
      try {
        const config = this.addAuthHeader(token);
        const response = await this.delete<ApiResponse>('/profile', config);
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to delete account';
        throw new Error(message);
      }
    },
  };

  /**
   * Get current API base URL (useful for debugging)
   */
  public getApiUrl(): string {
    return this.baseURL;
  }

  /**
   * Update base URL (useful for switching environments)
   */
  public updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
    this.api.defaults.baseURL = newBaseURL;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Helper function to download Excel file
export const downloadMembersExcel = async (token: string): Promise<void> => {
  try {
    const blob = await apiService.members.exportToExcel(token);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    link.download = `members_data_${today}.xlsx`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    throw error;
  }
};

// Helper function for mobile file downloads (using FileSystem API if available)
export const downloadMembersExcelMobile = async (token: string): Promise<string> => {
  try {
    // Import FileSystem and Sharing dynamically
    const FileSystem = await import('expo-file-system');
    const Sharing = await import('expo-sharing');
    
    // Create API call with proper headers
    const response = await fetch(`http://localhost:5000/api/members/admin/export-excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export members data');
    }

    // Get the blob and convert to base64
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });

    // Create filename with current date
    const fileName = `members_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    const fileUri = FileSystem.documentDirectory + fileName;

    // Write the file
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Save Members Data Excel File',
      });
    }

    return fileUri;
  } catch (error) {
    console.error('Error preparing Excel file for mobile download:', error);
    throw error;
  }
};

// Export class for testing or multiple instances
export { ApiService };

// Default export
export default apiService;
