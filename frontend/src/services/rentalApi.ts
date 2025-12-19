const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Farmer {
  id: number;
  firstName: string;
  secondName: string;
  email: string;
  phoneNo: string;
  county: string;
  localArea: string;
}

export interface Equipment {
  id: number;
  type: string;
  model: string;
  available: boolean;
  rate: number;
  imageUrl?: string;
  owner: Farmer;
}

export interface Rental {
  id: number;
  renter: Farmer;
  equipment: Equipment;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalCost: number;
  notes?: string;
}

class RentalApiService {
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

    // Don't set Content-Type for FormData - browser will set it with boundary
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
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  // Farmer endpoints
  async getFarmers(): Promise<Farmer[]> {
    return this.request<Farmer[]>('/farmers');
  }

  async createFarmer(farmer: Omit<Farmer, 'id'>): Promise<Farmer> {
    return this.request<Farmer>('/farmers', {
      method: 'POST',
      body: JSON.stringify(farmer),
    });
  }

  async getMyFarmerProfile(): Promise<Farmer> {
    return this.request<Farmer>('/farmers/my-profile');
  }

  async updateMyFarmerProfile(farmer: Partial<Farmer>): Promise<Farmer> {
    return this.request<Farmer>('/farmers/my-profile', {
      method: 'PUT',
      body: JSON.stringify(farmer),
    });
  }

  // Equipment endpoints
  async getEquipments(): Promise<Equipment[]> {
    return this.request<Equipment[]>('/equipments');
  }

  async getAvailableEquipments(): Promise<Equipment[]> {
    return this.request<Equipment[]>('/equipments/available');
  }

  async getEquipmentById(id: number): Promise<Equipment> {
    return this.request<Equipment>(`/equipments/${id}`);
  }

  async getEquipmentsByOwner(ownerId: number): Promise<Equipment[]> {
    return this.request<Equipment[]>(`/equipments/owner/${ownerId}`);
  }

  async createEquipment(equipment: Omit<Equipment, 'id' | 'owner'>, imageFile?: File): Promise<Equipment> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in first.');
    }

    const formData = new FormData();
    
    // Add equipment data as JSON Blob with correct Content-Type
    const equipmentBlob = new Blob([JSON.stringify(equipment)], { type: 'application/json' });
    formData.append('equipment', equipmentBlob);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };

    console.log('Creating equipment with token:', token.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/equipments`, {
      method: 'POST',
      headers,
      body: formData,
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
    return text ? JSON.parse(text) : {};
  }

  // Rental endpoints
  async getRentals(): Promise<Rental[]> {
    return this.request<Rental[]>('/rentals');
  }

  async getRentalById(id: number): Promise<Rental> {
    return this.request<Rental>(`/rentals/${id}`);
  }

  async getRentalsByFarmer(farmerId: number): Promise<Rental[]> {
    return this.request<Rental[]>(`/rentals/farmer/${farmerId}`);
  }

  async getRentalsByEquipment(equipmentId: number): Promise<Rental[]> {
    return this.request<Rental[]>(`/rentals/equipment/${equipmentId}`);
  }

  async getMyRentalRequests(): Promise<Rental[]> {
    return this.request<Rental[]>('/rentals/my-requests');
  }

  async getRentalsForMyEquipment(): Promise<Rental[]> {
    return this.request<Rental[]>('/rentals/my-equipment');
  }

  async createRental(rental: {
    equipment: { id: number };
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<Rental> {
    return this.request<Rental>('/rentals', {
      method: 'POST',
      body: JSON.stringify(rental),
    });
  }

  async approveRental(id: number): Promise<Rental> {
    return this.request<Rental>(`/rentals/${id}/approve`, {
      method: 'PUT',
    });
  }

  async confirmPayment(id: number): Promise<Rental> {
    return this.request<Rental>(`/rentals/${id}/confirm-payment`, {
      method: 'PUT',
    });
  }

  async startRental(id: number): Promise<Rental> {
    return this.request<Rental>(`/rentals/${id}/start`, {
      method: 'PUT',
    });
  }

  async completeRental(id: number): Promise<Rental> {
    return this.request<Rental>(`/rentals/${id}/complete`, {
      method: 'PUT',
    });
  }

  async cancelRental(id: number): Promise<Rental> {
    return this.request<Rental>(`/rentals/${id}/cancel`, {
      method: 'PUT',
    });
  }
}

export const rentalApi = new RentalApiService();

