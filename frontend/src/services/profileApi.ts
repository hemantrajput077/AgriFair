const API_BASE_URL = 'http://localhost:8080/api';

export interface ProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  // Farmer-specific
  farmName?: string;
  farmSize?: number;
  farmingType?: string;
  yearsOfExperience?: number;
  // Customer-specific
  preferredDeliveryTime?: string;
  // Metadata
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  // Farmer-specific
  farmName?: string;
  farmSize?: number;
  farmingType?: string;
  yearsOfExperience?: number;
  // Customer-specific
  preferredDeliveryTime?: string;
}

class ProfileApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only add Content-Type if not FormData (FormData sets its own)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<ProfileData> {
    return this.request<ProfileData>('/profile/me');
  }

  /**
   * Get user profile by username
   */
  async getProfileByUsername(username: string): Promise<ProfileData> {
    return this.request<ProfileData>(`/profile/${username}`);
  }

  /**
   * Update profile (text fields only)
   */
  async updateProfile(data: ProfileUpdateData): Promise<ProfileData> {
    return this.request<ProfileData>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Upload/Update profile image
   */
  async updateProfileImage(imageFile: File): Promise<ProfileData> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request<ProfileData>('/profile/image', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Delete profile image
   */
  async deleteProfileImage(): Promise<ProfileData> {
    return this.request<ProfileData>('/profile/image', {
      method: 'DELETE',
    });
  }
}

export const profileApi = new ProfileApiService();
