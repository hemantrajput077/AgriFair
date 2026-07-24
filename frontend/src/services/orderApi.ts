const API_BASE_URL = 'http://localhost:8080/api';

export interface OrderItemDto {
  cropId: number;
  quantity: number;
}

export interface OrderRequestDto {
  items: OrderItemDto[];
}

export interface OrderItemResponse {
  id: number;
  cropId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerUsername: string;
  totalAmount: number;
  status: string;
  createdDate: string;
  items: OrderItemResponse[];
}

export interface OrderStatusUpdateDto {
  status: string;
}

class OrderApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Making request to:', `${API_BASE_URL}${endpoint}`, 'with auth');
    } else {
      console.warn('No auth token found for request to:', endpoint);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);

        if (response.status === 401) {
          localStorage.removeItem('authToken');
          throw new Error('Authentication failed. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        }
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - is backend running on port 8080?');
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:8080');
      }
      throw error;
    }
  }

  async createOrder(orderData: OrderRequestDto): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders/my');
  }

  async getOrderById(orderId: number): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const orderApi = new OrderApiService();
