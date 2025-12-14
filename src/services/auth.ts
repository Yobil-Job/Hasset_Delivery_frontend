import axios from 'axios';
import api from '../utils/api';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    password: string;
    accountType: string;
    address?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    role: string;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Clear any existing tokens before login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('role');
            
            // Use raw axios for auth endpoints to avoid interceptor issues
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.data && response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('userRole', response.data.role);
                localStorage.setItem('role', response.data.role); // Keep both for compatibility
                return response.data;
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            // Re-throw with better error message
            if (error.response) {
                throw new Error(error.response.data?.message || error.response.data?.error || 'Login failed');
            } else if (error.request) {
                throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
            } else {
                throw new Error(error.message || 'Login failed');
            }
        }
    },

    async signup(data: SignupData): Promise<any> {
        try {
            // Clear any existing tokens before signup
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('role');
            
            // Use raw axios for auth endpoints to avoid interceptor issues
            const response = await axios.post(`${API_URL}/auth/register`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Signup error:', error);
            // Re-throw with better error message
            if (error.response) {
                throw new Error(error.response.data?.message || error.response.data?.error || 'Registration failed');
            } else if (error.request) {
                throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
            } else {
                throw new Error(error.message || 'Registration failed');
            }
        }
    },

    async verifyEmail(email: string, code: string): Promise<void> {
        await axios.post(`${API_URL}/auth/verify-email`, { email, code }, {
            headers: { 'Content-Type': 'application/json' },
        });
    },

    async forgotPassword(email: string): Promise<void> {
        await axios.post(`${API_URL}/auth/forgot-password`, { email }, {
            headers: { 'Content-Type': 'application/json' },
        });
    },

    async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
        await axios.post(`${API_URL}/auth/reset-password`, { email, code, newPassword }, {
            headers: { 'Content-Type': 'application/json' },
        });
    },

    async resendVerificationCode(email: string): Promise<void> {
        await axios.post(`${API_URL}/auth/resend-verification`, { email }, {
            headers: { 'Content-Type': 'application/json' },
        });
    },

    async logout(): Promise<void> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await api.post('/auth/logout', { refreshToken });
            } catch (error) {
                // Ignore logout errors
            }
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userRole');
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },
};
