import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, ZoomIn, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { deliveryProofService, DeliveryProof } from '../../services/deliveryProofService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '../ui/dialog';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../../utils/api';

interface DeliveryProofProps {
    orderNumber: string;
    isDriver?: boolean;
}

export function DeliveryProofComponent({ orderNumber, isDriver = false }: DeliveryProofProps) {
    const [proofs, setProofs] = useState<DeliveryProof[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        fetchProofs();
        connectWebSocket();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [orderNumber]);

    const connectWebSocket = () => {
        // SECURITY: Use environment variable only - no hardcoded URLs
        const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/?api\/?$/, '');
        const wsHttpUrl = `${apiBaseUrl}/ws-location`; // Use same endpoint as location

        const socket = new SockJS(wsHttpUrl);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                // Subscribe to delivery proof updates for this order
                const topic = `/topic/delivery-proof/${orderNumber}`;
                client.subscribe(topic, (message) => {
                    const newProof: DeliveryProof = JSON.parse(message.body);
                    
                    setProofs(prev => {
                        // Avoid duplicates
                        if (prev.some(p => p.id === newProof.id)) {
                            return prev;
                        }
                        // Ensure absolute URL
                        const proofWithAbsoluteUrl = {
                            ...newProof,
                            imageUrl: newProof.imageUrl.startsWith('http') 
                                ? newProof.imageUrl 
                                : `${apiBaseUrl}${newProof.imageUrl}`
                        };
                        return [proofWithAbsoluteUrl, ...prev];
                    });
                    
                    // Show notification
                    if (!isDriver) {
                        toast.success(`New delivery proof uploaded by ${newProof.uploadedBy}`);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Delivery Proof WebSocket error:', frame);
            },
            onDisconnect: () => {
            }
        });

        client.activate();
        stompClientRef.current = client;
    };

    const fetchProofs = async () => {
        try {
            setLoading(true);
            const data = await deliveryProofService.getProofs(orderNumber);
            // Ensure image URLs are absolute
            const proofsWithAbsoluteUrls = data.map(proof => ({
                ...proof,
                imageUrl: proof.imageUrl.startsWith('http') 
                    ? proof.imageUrl 
                    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}${proof.imageUrl}`
            }));
            setProofs(proofsWithAbsoluteUrls);
        } catch (error: any) {
            console.error('Failed to fetch delivery proofs', error);
            const errorMsg = error.response?.data?.error || 'Failed to load delivery proofs';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (file: File) => {
        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            await deliveryProofService.uploadProof(orderNumber, file);
            toast.success('Delivery proof uploaded successfully');
            await fetchProofs();
        } catch (error: any) {
            console.error('Failed to upload proof', error);
            toast.error(error.response?.data?.error || 'Failed to upload delivery proof');
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    const openImage = (imageUrl: string, index: number) => {
        setSelectedImage(imageUrl);
        setCurrentImageIndex(index);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (selectedImage) {
            const currentIndex = proofs.findIndex(p => p.imageUrl === selectedImage);
            let newIndex;
            if (direction === 'prev') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : proofs.length - 1;
            } else {
                newIndex = currentIndex < proofs.length - 1 ? currentIndex + 1 : 0;
            }
            setSelectedImage(proofs[newIndex].imageUrl);
            setCurrentImageIndex(newIndex);
        }
    };

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-border/50 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ImageIcon className="h-5 w-5 text-primary" />
                            Delivery Proof
                        </CardTitle>
                        {isDriver && (
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />
                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleCameraInputChange}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => cameraInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <Camera className="h-4 w-4 mr-2" />
                                    Camera
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {uploading && (
                        <div className="mb-4 p-3 bg-primary/10 rounded-lg text-sm text-primary">
                            Uploading image...
                        </div>
                    )}

                    {proofs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No delivery proofs uploaded yet</p>
                            {isDriver && (
                                <p className="text-sm mt-2">Upload a photo to provide delivery proof</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {proofs.map((proof, index) => (
                                <div
                                    key={proof.id}
                                    className="relative group cursor-pointer"
                                    onClick={() => openImage(proof.imageUrl, index)}
                                >
                                    <div className="aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted">
                                        <img
                                            src={proof.imageUrl}
                                            alt={`Delivery proof ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                console.error('Failed to load image:', proof.imageUrl);
                                                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <p className="font-medium">{proof.uploadedBy}</p>
                                        <p>{format(new Date(proof.uploadedAt), 'MMM d, yyyy h:mm a')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Image Viewer Dialog */}
            <Dialog open={selectedImage !== null} onOpenChange={closeImage}>
                <DialogContent className="max-w-4xl p-0 bg-black/95">
                    {selectedImage && (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                                onClick={closeImage}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            {proofs.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                                        onClick={() => navigateImage('prev')}
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                                        onClick={() => navigateImage('next')}
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </>
                            )}
                            <div className="flex items-center justify-center min-h-[400px] p-4">
                                <img
                                    src={selectedImage}
                                    alt="Delivery proof"
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            </div>
                            {proofs[currentImageIndex] && (
                                <div className="p-4 bg-black/50 text-white text-sm">
                                    <p className="font-medium">{proofs[currentImageIndex].uploadedBy}</p>
                                    <p className="text-white/70">
                                        {format(new Date(proofs[currentImageIndex].uploadedAt), 'MMMM d, yyyy at h:mm a')}
                                    </p>
                                    <p className="text-white/50 mt-1">
                                        {currentImageIndex + 1} of {proofs.length}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

