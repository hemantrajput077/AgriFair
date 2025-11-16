const API_BASE_URL = 'http://localhost:8080/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making API request to:', url);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(errorText || `HTTP error! status: ${response.status}`, response.status);
      }
      
      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }
      
      return JSON.parse(text);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError(error.message);
      }
      throw new ApiError('An unexpected error occurred');
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<string> {
    console.log('Registering user with data:', userData);
    return this.request<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Helper method to get auth token from localStorage
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Helper method to save auth token to localStorage
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Helper method to remove auth token from localStorage
  removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
export default apiService;
