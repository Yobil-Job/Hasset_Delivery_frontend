import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import { useRef } from 'react';
import { authService } from '../services/auth';

export function useNotifications() {
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        const connectNotifications = async () => {
            // Don't connect on auth pages
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/driver/signup' || currentPath === '/sys-admin-portal-x9k2') {
                return;
            }

            // Only connect if user is authenticated
            const token = localStorage.getItem('accessToken');
            if (!token) {
                return; // Not logged in, skip notification setup
            }

            try {
                // Add a small delay to ensure auth is complete
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const userData = await authService.getCurrentUser();
                const userId = userData.id;

                // SECURITY: Use environment variable only - no hardcoded URLs
                const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/?api\/?$/, '');
                const wsHttpUrl = `${apiBaseUrl}/ws-location`;

                const socket = new SockJS(wsHttpUrl);
                const client = new Client({
                    webSocketFactory: () => socket,
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    onConnect: () => {
                        // Subscribe to user-specific notifications
                        const topic = `/topic/notifications/${userId}`;
                        client.subscribe(topic, (message) => {
                            const notification = JSON.parse(message.body);
                            
                            if (notification.type === 'NEW_MESSAGE') {
                                toast.info(`New message from ${notification.senderName}: ${notification.preview}`, {
                                    action: {
                                        label: 'View',
                                        onClick: () => {
                                            // Navigate to order details or open chat
                                            window.location.href = `/orders/${notification.orderNumber}`;
                                        }
                                    }
                                });
                            }
                        });
                    },
                    onStompError: (frame) => {
                        console.error('Notifications WebSocket error:', frame);
                    },
                    onDisconnect: () => {
                    }
                });

                client.activate();
                stompClientRef.current = client;
            } catch (error) {
                console.error('Failed to connect to notifications:', error);
            }
        };

        connectNotifications();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    return null;
}

