import axios from 'axios';

const API_URL = 'http://localhost:8080/api/customers';

export interface SavedAddress {
    id: number;
    label: string;
    address: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    createdAt: string;
}

export interface SavedAddressRequest {
    label: string;
    address: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
}

export const savedAddressService = {
    getAddresses: async (): Promise<SavedAddress[]> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get<SavedAddress[]>(`${API_URL}/me/addresses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getAddress: async (id: number): Promise<SavedAddress> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get<SavedAddress>(`${API_URL}/me/addresses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    createAddress: async (data: SavedAddressRequest): Promise<SavedAddress> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post<SavedAddress>(`${API_URL}/me/addresses`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateAddress: async (id: number, data: SavedAddressRequest): Promise<SavedAddress> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.put<SavedAddress>(`${API_URL}/me/addresses/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteAddress: async (id: number): Promise<void> => {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/me/addresses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};

