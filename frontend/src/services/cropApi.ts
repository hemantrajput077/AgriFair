const API_BASE_URL = 'http://localhost:8080/api';

export interface Crop {
  id: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  organic: boolean;
  photoUrl?: string;
  farmerUsername: string;
}

export interface CropRequestDto {
  productName: string;
  description: string;
  price: number;
  quantity: number;
  organic: boolean;
  photoUrl?: string;
}

class CropApiService {
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

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Request to', endpoint, 'with Authorization header');
    } else {
      console.warn('No token found for request to', endpoint);
    }

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Request failed:', response.status, errorText);
      if (response.status === 401) {
        // Clear invalid token
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

  async getCrops(): Promise<Crop[]> {
    return this.request<Crop[]>('/crops');
  }

  async getMyCrops(): Promise<Crop[]> {
    return this.request<Crop[]>('/crops/my');
  }

  async createCrop(cropData: CropRequestDto, imageFile?: File): Promise<Crop> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in first.');
    }

    const formData = new FormData();
    
    // Add crop data as JSON Blob with correct Content-Type
    const cropBlob = new Blob([JSON.stringify(cropData)], { type: 'application/json' });
    formData.append('crop', cropBlob);
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    console.log('Creating crop with token:', token ? 'Token present' : 'No token');
    console.log('FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? v.name : v]));

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/crops`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Crop creation failed:', response.status, errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
}

export const cropApi = new CropApiService();

