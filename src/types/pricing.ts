// Pricing Configuration Interface
export interface PricingConfig {
    id: number;
    baseFee: number;
    distanceRatePerKm: number;
    freeWeightLimit: number;
    additionalWeightFeePerKg: number;
}

// Subscription Plan Interface
export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: string;
    period: string;
    features: string[];
    badge?: string;
    popular: boolean;
    gradient: string;
    icon: string;
    amount: number;
}
