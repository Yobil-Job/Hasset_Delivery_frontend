import api from '../utils/api';

export interface FavoriteService {
    id: number;
    name: string;
    orderCount: number;
}

export interface SpendingTrend {
    period: string;
    amount: number;
}

export interface LocationStats {
    address: string;
    count: number;
}

export interface AnalyticsResponse {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteService: FavoriteService | null;
    spendingTrend: SpendingTrend[];
    orderFrequency: string;
    topPickupLocations: LocationStats[];
    topDeliveryLocations: LocationStats[];
}

export const analyticsService = {
    getAnalytics: async (period: 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsResponse> => {
        const response = await api.get<AnalyticsResponse>(`/customers/me/analytics?period=${period}`);
        return response.data;
    }
};

