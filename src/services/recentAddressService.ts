import axios from 'axios';

const API_URL = 'http://localhost:8080/api/customers';

export interface RecentAddress {
    id: number;
    address: string;
    lat: number;
    lng: number;
    lastUsed: string;
    type: 'pickup' | 'delivery';
}

export const recentAddressService = {
    getRecentAddresses: async (limit: number = 5): Promise<RecentAddress[]> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get<RecentAddress[]>(`${API_URL}/me/recent-addresses`, {
            params: { limit },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateLastUsed: async (addressId: number): Promise<void> => {
        const token = localStorage.getItem('accessToken');
        await axios.put(`${API_URL}/me/recent-addresses/${addressId}/update-last-used`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};

