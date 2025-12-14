import { useEffect, useState, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageBubble } from './MessageBubble';
import { messageService, Message, SendMessageRequest } from '../../services/messageService';
import { toast } from 'sonner';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ChatWindowProps {
    orderNumber: string;
    currentUserId: number;
    recipientId: number;
    recipientName: string;
    onClose?: () => void;
}

export function ChatWindow({ orderNumber, currentUserId, recipientId, recipientName, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        fetchMessages();
        connectWebSocket();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [orderNumber]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await messageService.getMessages(orderNumber);
            setMessages(data);
            // Mark all messages as read when opening chat
            await messageService.markOrderMessagesAsRead(orderNumber);
        } catch (error) {
            console.error('Failed to fetch messages', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        // SECURITY: Use environment variable only - no hardcoded URLs
        const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/?api\/?$/, '');
        const wsHttpUrl = `${apiBaseUrl}/ws-chat`;

        const socket = new SockJS(wsHttpUrl);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setConnected(true);
                
                // Subscribe to chat topic for this order
                const topic = `/topic/chat/${orderNumber}`;
                
                client.subscribe(topic, (message) => {
                    const newMsg: Message = JSON.parse(message.body);
                    
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMsg.id)) {
                            return prev;
                        }
                        return [...prev, newMsg];
                    });
                    
                    // Mark as read if it's for current user
                    if (newMsg.recipientId === currentUserId) {
                        messageService.markAsRead(newMsg.id).catch(console.error);
                        // Show notification
                        toast.info(`New message from ${newMsg.senderName || 'User'}`);
                    }
                    
                    scrollToBottom();
                });
            },
            onStompError: (frame) => {
                console.error('Chat WebSocket STOMP error:', frame);
                setConnected(false);
            },
            onDisconnect: () => {
                setConnected(false);
            }
        });

        client.activate();
        stompClientRef.current = client;
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const request: SendMessageRequest = {
                orderNumber,
                message: messageText,
                recipientId
            };

            // Send via REST API (which will broadcast via WebSocket)
            const sentMessage = await messageService.sendMessage(request);
            setMessages(prev => [...prev, sentMessage]);
            scrollToBottom();
            
            // Show success notification
            toast.success('Message sent!');
        } catch (error: any) {
            console.error('Failed to send message', error);
            toast.error(error.response?.data?.error || 'Failed to send message');
            setNewMessage(messageText); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <Card className="h-[500px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-[500px] border-border/50 shadow-lg">
            <CardHeader className="pb-3 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Chat with {recipientName}</CardTitle>
                        {connected && (
                            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                                Online
                            </span>
                        )}
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwn={message.senderId === currentUserId}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="border-t p-4 flex-shrink-0">
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                            disabled={sending}
                        />
                        <Button type="submit" disabled={sending || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

