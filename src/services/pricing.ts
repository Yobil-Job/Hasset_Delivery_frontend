import axios from 'axios';

const API_URL = 'http://localhost:8080/api/pricing';

export interface PricingConfiguration {
    id: number;
    baseFee: number;
    distanceRatePerKm: number;
    freeWeightLimit: number;
    additionalWeightFeePerKg: number;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: string;
    period: string;
    features: string[];
    badge?: string;
    gradient: string;
    icon: string;
    popular: boolean;
    amount: number;
}

export interface ServiceOffering {
    id: number;
    title: string;
    description: string;
    priceText: string;
    features: string[];
    imageUrl: string;
    gradient: string;
    icon: string;
    multiplier: number;
}

export interface PriceCalculationResponse {
    baseFee: number;
    distanceCost: number;
    weightFee: number;
    serviceFee: number;
    serviceName: string;
    total: number;
}

export const pricingService = {
    getConfig: async (): Promise<PricingConfiguration[]> => {
        const response = await axios.get<PricingConfiguration[]>(`${API_URL}/config`);
        return response.data;
    },

    getPlans: async (): Promise<SubscriptionPlan[]> => {
        const response = await axios.get<SubscriptionPlan[]>(`${API_URL}/plans`);
        return response.data;
    },

    getServices: async (): Promise<ServiceOffering[]> => {
        const response = await axios.get<ServiceOffering[]>(`${API_URL}/services`);
        return response.data;
    },

    calculatePrice: async (
        weight: number,
        arg2: number,
        arg3: number,
        arg4?: number,
        arg5?: number,
        arg6?: number
    ): Promise<PriceCalculationResponse> => {
        // Check if we're calling with (weight, distance, serviceId)
        if (arg4 === undefined) {
            const distance = arg2;
            const serviceId = arg3;
            const response = await axios.post<PriceCalculationResponse>(`${API_URL}/calculate`, {
                weight,
                distance,
                serviceId
            });
            return response.data;
        } else {
            // Calling with (weight, pickupLat, pickupLng, deliveryLat, deliveryLng, serviceId)
            const pickupLat = arg2;
            const pickupLng = arg3;
            const deliveryLat = arg4;
            const deliveryLng = arg5;
            const serviceId = arg6;
            const response = await axios.post<PriceCalculationResponse>(`${API_URL}/calculate`, {
                weight,
                pickupLat,
                pickupLng,
                deliveryLat,
                deliveryLng,
                serviceId
            });
            return response.data;
        }
    }
};
