import { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Navigation, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { orderService, ETAResponse } from '../../services/orderService';

interface ETACountdownProps {
    orderNumber: string;
    orderStatus?: string;
    className?: string;
}

export function ETACountdown({ orderNumber, orderStatus, className = '' }: ETACountdownProps) {
    const [etaData, setEtaData] = useState<ETAResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const fetchETA = async () => {
        try {
            const data = await orderService.getETA(orderNumber);
            setEtaData(data);
            setError(null);
            
            // Only show countdown if order is in transit
            if (data.currentStatus === 'ON_THE_WAY' || data.currentStatus === 'PICKED_UP') {
                setRemainingMinutes(data.estimatedMinutes);
            } else {
                setRemainingMinutes(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch ETA:', err);
            if (err.response?.status === 404) {
                setError('Order not found');
            } else {
                setError('Unable to calculate ETA');
            }
            setEtaData(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch ETA on mount and every 30 seconds
    useEffect(() => {
        fetchETA();

        intervalRef.current = setInterval(() => {
            fetchETA();
        }, 30000); // 30 seconds

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [orderNumber]);

    // Update countdown every minute
    useEffect(() => {
        if (remainingMinutes === null || remainingMinutes <= 0) {
            return;
        }

        countdownRef.current = setInterval(() => {
            setRemainingMinutes((prev) => {
                if (prev === null || prev <= 0) {
                    return 0;
                }
                return prev - 1;
            });
        }, 60000); // Update every minute

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [remainingMinutes, etaData?.estimatedMinutes]);

    // Reset countdown when ETA data updates
    useEffect(() => {
        if (etaData?.estimatedMinutes) {
            setRemainingMinutes(etaData.estimatedMinutes);
        }
    }, [etaData?.estimatedMinutes]);

    if (loading) {
        return (
            <Card className={`border-border/50 ${className}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Calculating ETA...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return null; // Don't show error, just hide component
    }

    if (!etaData) {
        return null;
    }

    // Only show for orders in transit
    const isInTransit = etaData.currentStatus === 'ON_THE_WAY' || etaData.currentStatus === 'PICKED_UP';
    
    if (!isInTransit) {
        return null;
    }

    const formatTime = (minutes: number): string => {
        if (minutes <= 0) return 'Arrived';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const formatArrivalTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const progressPercentage = remainingMinutes && etaData.estimatedMinutes
        ? Math.max(0, Math.min(100, ((etaData.estimatedMinutes - remainingMinutes) / etaData.estimatedMinutes) * 100))
        : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5 ${className}`}>
                    <CardContent className="p-5">
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Estimated Arrival</h3>
                                        <p className="text-xs text-muted-foreground">Real-time ETA</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                    {etaData.currentStatus.replace(/_/g, ' ')}
                                </Badge>
                            </div>

                            {/* Countdown Timer */}
                            <div className="text-center py-2">
                                <motion.div
                                    key={remainingMinutes}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent"
                                >
                                    {remainingMinutes !== null ? formatTime(remainingMinutes) : 'Calculating...'}
                                </motion.div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Arriving at {etaData.estimatedArrival ? formatArrivalTime(etaData.estimatedArrival) : 'Calculating...'}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary to-orange-600 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{Math.round(progressPercentage)}% complete</span>
                                    <span>{etaData.remainingDistanceKm.toFixed(1)} km remaining</span>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Distance</p>
                                        <p className="text-sm font-medium">{etaData.remainingDistanceKm.toFixed(1)} km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Navigation className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Avg Speed</p>
                                        <p className="text-sm font-medium">{etaData.averageSpeedKmh.toFixed(0)} km/h</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}

