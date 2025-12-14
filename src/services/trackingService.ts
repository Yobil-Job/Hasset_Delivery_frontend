import api from '../utils/api';

export interface LiveLocation {
    latitude: number;
    longitude: number;
    timestamp: number;
}

export const trackingService = {
    async getLiveLocation(orderId: string | number): Promise<LiveLocation> {
        const response = await api.get<LiveLocation>(`/orders/${orderId}/live-location`);
        return response.data;
    }
};
