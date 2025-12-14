import axios from 'axios';

const API_URL = 'http://localhost:8080/api/orders';

export interface CreateOrderRequest {
    serviceId: number;
    weightKg: number;
    pickupAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    deliveryAddress: string;
    deliveryLatitude: number;
    deliveryLongitude: number;

}

export interface ServiceOffering {
    id: number;
    name: string;
    description?: string;
}

export interface Driver {
    id: number;
    user?: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        phoneNumber?: string;
    };
}

export interface OrderResponse {
    orderNumber: string;
    weightKg: number;
    distanceKm: number;
    price: number;
    pickupAddress: string;
    deliveryAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    deliveryLatitude: number;
    deliveryLongitude: number;
    status: 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED';
    createdAt: string;
    serviceOffering?: ServiceOffering;
    driver?: Driver;
    customerId?: number;
}

export interface ETAResponse {
    estimatedArrival: string;
    estimatedMinutes: number;
    currentStatus: string;
    driverLocation: {
        lat: number;
        lng: number;
    };
    destinationLocation: {
        lat: number;
        lng: number;
    };
    remainingDistanceKm: number;
    averageSpeedKmh: number;
}

export interface ReorderResponse {
    newOrderNumber: string;
    orderId: number;
    price: number;
}

export interface OrderFilters {
    status?: string;
    startDate?: string;
    endDate?: string;
    minPrice?: number;
    maxPrice?: number;
    serviceId?: number;
}

export const orderService = {
    createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post<OrderResponse>(API_URL, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getMyOrders: async (filters?: OrderFilters): Promise<OrderResponse[]> => {
        const token = localStorage.getItem('accessToken');
        const params = new URLSearchParams();
        
        if (filters) {
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.serviceId) params.append('serviceId', filters.serviceId.toString());
        }
        
        const url = `${API_URL}/my${params.toString() ? '?' + params.toString() : ''}`;
        const response = await axios.get<OrderResponse[]>(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getOrderByNumber: async (orderNumber: string): Promise<OrderResponse> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get<OrderResponse>(`${API_URL}/${orderNumber}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getETA: async (orderNumber: string): Promise<ETAResponse> => {
        // Public endpoint, no auth required
        const response = await axios.get<ETAResponse>(`${API_URL}/track/${orderNumber}/eta`);
        return response.data;
    },

    reorder: async (orderNumber: string): Promise<ReorderResponse> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post<ReorderResponse>(`${API_URL}/${orderNumber}/reorder`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
