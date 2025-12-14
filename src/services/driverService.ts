import api from '../utils/api';

export interface Driver {
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    user: {
        firstname: string;
        lastname: string;
        email: string;
        phoneNumber: string;
    };
}

export interface LocationUpdate {
    latitude: number;
    longitude: number;
}

export const driverService = {
    async registerDriver(data: {
        firstname: string;
        lastname: string;
        email: string;
        phoneNumber: string;
        password: string;
        vehicleType: string;
        licenseNumber: string;
    }) {
        const response = await api.post('/drivers/register', {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: data.password,
            accountType: 'driver',
            // keep address optional / empty for now; vehicle info stored in dedicated fields
            address: '',
            vehicleType: data.vehicleType,
            licenseNumber: data.licenseNumber,
        });
        return response.data;
    },

    async updateLocation(location: LocationUpdate) {
        const response = await api.post('/driver/location/update', location);
        return response.data;
    },

    async updateOrderStatus(orderNumber: string, status: string) {
        const response = await api.patch(`/orders/${orderNumber}/status`, { status });
        return response.data;
    },

    async getActiveOrder() {
        const response = await api.get('/orders/active-order');
        return response.data;
    },

    async getDriverProfile() {
        const response = await api.get('/drivers/me');
        return response.data;
    }
};
