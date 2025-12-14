import axios from 'axios';

const API_URL = 'http://localhost:8080/api/messages';

export interface Message {
    id: number;
    orderNumber: string;
    senderId: number;
    senderName: string;
    recipientId: number;
    message: string;
    messageType: string;
    fileUrl?: string;
    timestamp: string;
    isRead: boolean;
}

export interface SendMessageRequest {
    orderNumber: string;
    message: string;
    recipientId: number;
    messageType?: string;
    fileUrl?: string;
}

export const messageService = {
    getMessages: async (orderNumber: string): Promise<Message[]> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get<Message[]>(`${API_URL}/order/${orderNumber}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    sendMessage: async (data: SendMessageRequest): Promise<Message> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post<Message>(API_URL, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get<{ count: number }>(`${API_URL}/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.count;
    },

    markAsRead: async (messageId: number): Promise<void> => {
        const token = localStorage.getItem('accessToken');
        await axios.put(`${API_URL}/${messageId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    markOrderMessagesAsRead: async (orderNumber: string): Promise<void> => {
        const token = localStorage.getItem('accessToken');
        await axios.put(`${API_URL}/order/${orderNumber}/read-all`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};

