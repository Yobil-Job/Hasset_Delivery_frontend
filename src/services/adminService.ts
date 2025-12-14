import api from '../utils/api';
import { Driver } from './driverService';

export interface ActiveDriver {
    driverId: number;
    driverName: string;
    currentOrderId: number;
    location: string; // "lat,lon,timestamp"
}

export interface AdminCustomer {
    id: number;
    email: string;
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    createdAt?: string;
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: string;
}

export const adminService = {
    async getActiveDrivers(): Promise<ActiveDriver[]> {
        const response = await api.get<ActiveDriver[]>('/admin/drivers/active');
        return response.data;
    },

    async getAllDrivers(): Promise<Driver[]> {
        const response = await api.get<Driver[]>('/admin/drivers');
        return response.data;
    },

    async getAllOrders() {
        const response = await api.get('/admin/orders');
        return response.data;
    },

    async getAllCustomers(): Promise<AdminCustomer[]> {
        const response = await api.get<AdminCustomer[]>('/admin/customers');
        return response.data;
    },

    async assignDriver(orderId: number, driverId: number) {
        try {
            // Primary endpoint (path parameters)
            const response = await api.post(`/admin/orders/${orderId}/assign-driver/${driverId}`);
            return response.data;
        } catch (error: any) {
            // Fallback to a body-based endpoint if the first one is not found / not allowed
            if (error?.response && (error.response.status === 404 || error.response.status === 405)) {
                const fallbackResponse = await api.post('/admin/orders/assign-driver', {
                    orderId,
                    driverId,
                });
                return fallbackResponse.data;
            }
            throw error;
        }
    },

    async getPendingDrivers(): Promise<Driver[]> {
        const response = await api.get<Driver[]>('/admin/drivers/pending');
        return response.data;
    },

    async approveDriver(driverId: number) {
        const response = await api.put(`/admin/drivers/${driverId}/approve`);
        return response.data;
    },

    async rejectDriver(driverId: number) {
        const response = await api.put(`/admin/drivers/${driverId}/reject`);
        return response.data;
    },

    async suspendDriver(driverId: number) {
        const response = await api.put(`/admin/drivers/${driverId}/suspend`);
        return response.data;
    },

    async getAllServices() {
        const response = await api.get('/admin/pricing/services');
        return response.data;
    },

    async createService(service: any) {
        const response = await api.post('/admin/pricing/services', service);
        return response.data;
    },

    async updateService(id: number, service: any) {
        const response = await api.put(`/admin/pricing/services/${id}`, service);
        return response.data;
    },

    async deleteService(id: number) {
        const response = await api.delete(`/admin/pricing/services/${id}`);
        return response.data;
    },

    // Pricing Configuration
    async getPricingConfig() {
        const response = await api.get('/admin/pricing/config');
        return response.data;
    },

    async updatePricingConfig(id: number, data: any) {
        const response = await api.put(`/admin/pricing/config/${id}`, data);
        return response.data;
    },

    async createPricingConfig(data: any) {
        const response = await api.post('/admin/pricing/config', data);
        return response.data;
    },

    async deletePricingConfig(id: number) {
        const response = await api.delete(`/admin/pricing/config/${id}`);
        return response.data;
    },

    // Subscription Plans
    async getSubscriptionPlans() {
        const response = await api.get('/admin/pricing/plans');
        return response.data;
    },

    async createSubscriptionPlan(data: any) {
        const response = await api.post('/admin/pricing/plans', data);
        return response.data;
    },

    async updateSubscriptionPlan(id: number, data: any) {
        const response = await api.put(`/admin/pricing/plans/${id}`, data);
        return response.data;
    },

    async deleteSubscriptionPlan(id: number) {
        const response = await api.delete(`/admin/pricing/plans/${id}`);
        return response.data;
    }
};
