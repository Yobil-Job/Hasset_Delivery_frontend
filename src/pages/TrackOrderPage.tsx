import { useState, useEffect, useRef } from 'react';
import { Search, Package, Truck, MapPin, CheckCircle, Clock, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SEO } from '../components/global/SEO';
import { Card3D } from '../components/global/Card3D';
import { GlassCard } from '../components/global/GlassCard';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { PaymentModal } from '../components/global/PaymentModal';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import api from '../utils/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { LiveTrackingMap } from '../components/LiveTrackingMap';
import { ETACountdown } from '../components/order/ETACountdown';
import { DeliveryProofComponent } from '../components/order/DeliveryProof';
import { ChatWindow } from '../components/chat/ChatWindow';
import { authService } from '../services/auth';
import { orderService, OrderResponse } from '../services/orderService';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Types for better type safety
interface TimelineEvent {
  status: string;
  location: string;
  time: string;
  completed: boolean;
  current?: boolean;
}

interface TrackingData {
  id: string;
  status: 'Order Placed' | 'Processing' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception';
  currentLocation: string;
  estimatedDelivery: string;
  timeline: TimelineEvent[];
  packageDetails: {
    weight: string;
    dimensions: string;
    service: string;
  };
  deliveryInfo: {
    driver: string;
    driverId?: number;
    vehicle: string;
    contact: string;
  };
  paymentRequired?: boolean;
  amount?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  deliveryCoordinates?: {
    lat: number;
    lng: number;
  };
}

export function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const userData = await authService.getCurrentUser();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        // User not logged in, that's okay for public tracking
      }
    };
    fetchUser();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const validateTrackingNumber = (number: string): boolean => {
    return number.length >= 5;
  };

  async function fetchLiveLocation(orderId?: string) {
    const targetOrderId = orderId ?? trackingData?.id;
    if (!targetOrderId) return;
    try {
      const locRes = await api.get(`/orders/track/${targetOrderId}/live-location`);
      setTrackingData(prev => prev ? ({
        ...prev,
        coordinates: {
          lat: locRes.data.latitude,
          lng: locRes.data.longitude
        }
      }) : null);
      toast.success("Map updated with live location");
    } catch (e: any) {
      console.error("Live location fetch failed:", e.response?.status, e.response?.data);
      toast.error("Driver location not available yet");
    }
  }

  function handleOrderUpdate(order: any) {
    fetchOrderDetails(order.orderNumber);
    toast.info(`Order status updated: ${order.status}`);
  }

  function connectWebSocket(orderId: string, driverId?: number) {
    if (stompClientRef.current && stompClientRef.current.active) return;

    // Derive WebSocket endpoint from the same base URL used by the API client
    const apiBaseUrl = (api.defaults.baseURL || '').replace(/\/?api\/?$/, '');
    const wsHttpUrl = `${apiBaseUrl}/ws-location`;

    const socket = new SockJS(wsHttpUrl);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/orders/${orderId}`, (message) => {
          const updatedOrder = JSON.parse(message.body);
          handleOrderUpdate(updatedOrder);
        });

        if (driverId) {
          client.subscribe('/topic/locations', (message) => {
            const locationUpdate = JSON.parse(message.body);
            if (String(locationUpdate.deviceId) === String(driverId)) {
              setTrackingData(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  currentLocation: 'On the way',
                  coordinates: {
                    lat: locationUpdate.latitude,
                    lng: locationUpdate.longitude
                  }
                };
              });
            }
          });
        }
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame.headers['message']);
      },
      onDisconnect: () => {
      }
    });

    client.activate();
    stompClientRef.current = client;
  }

  async function fetchOrderDetails(number: string) {
    try {
      const response = await api.get(`/orders/track/${number}`);
      const order = response.data;
      
      // Store order data for chat and delivery proof
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const fullOrder = await orderService.getOrderByNumber(number);
          setOrderData(fullOrder);
        }
      } catch (err) {
        // If not authenticated, that's okay
      }

      const data: TrackingData = {
        id: order.orderNumber,
        status: order.status === 'CREATED' ? 'Order Placed' :
          order.status === 'ASSIGNED' ? 'Processing' :
            order.status === 'PICKED_UP' ? 'In Transit' :
              order.status === 'ON_THE_WAY' ? 'Out for Delivery' :
                order.status === 'DELIVERED' ? 'Delivered' : 'Exception',
        currentLocation: order.status === 'DELIVERED' ? order.deliveryAddress :
          ['PICKED_UP', 'ON_THE_WAY'].includes(order.status) ? 'On the way' :
            order.pickupAddress,
        estimatedDelivery: 'Calculating...',
        timeline: [
          {
            status: 'Order Placed',
            location: order.pickupAddress,
            time: new Date(order.createdAt).toLocaleString(),
            completed: true
          },
          {
            status: 'Driver Assigned',
            location: order.pickupAddress,
            time: order.driver ? 'Assigned' : 'Pending',
            completed: !!order.driver
          },
          {
            status: 'Picked Up',
            location: order.pickupAddress,
            time: ['PICKED_UP', 'ON_THE_WAY', 'DELIVERED'].includes(order.status) ? 'Completed' : 'Pending',
            completed: ['PICKED_UP', 'ON_THE_WAY', 'DELIVERED'].includes(order.status),
            current: order.status === 'PICKED_UP'
          },
          {
            status: 'In Transit',
            location: 'On the way',
            time: ['ON_THE_WAY', 'DELIVERED'].includes(order.status) ? 'In Progress' : 'Pending',
            completed: ['ON_THE_WAY', 'DELIVERED'].includes(order.status),
            current: order.status === 'ON_THE_WAY'
          },
          {
            status: 'Delivered',
            location: order.deliveryAddress,
            time: order.status === 'DELIVERED' ? 'Delivered' : 'Pending',
            completed: order.status === 'DELIVERED'
          },
        ],
        packageDetails: {
          weight: `${order.weightKg} kg`,
          dimensions: 'Standard',
          service: 'Standard Delivery'
        },
        deliveryInfo: {
          driver: order.driver?.user ? `${order.driver.user.firstname} ${order.driver.user.lastname}` : 'Assigning...',
          driverId: order.driver?.id,
          vehicle: order.driver ? 'Motorbike' : 'Pending',
          contact: order.driver?.user ? order.driver.user.phoneNumber : 'Pending'
        },
        paymentRequired: false, // Default false until integrated
        amount: order.price || 0,
        pickupCoordinates: order.pickupLatitude && order.pickupLongitude
          ? { lat: order.pickupLatitude, lng: order.pickupLongitude }
          : undefined,
        deliveryCoordinates: order.deliveryLatitude && order.deliveryLongitude
          ? { lat: order.deliveryLatitude, lng: order.deliveryLongitude }
          : undefined
      };

      setTrackingData(data);
      setError(null);
      // Try to connect to WebSocket, but don't fail the whole request if it fails
      try {
        connectWebSocket(order.orderNumber, order.driver?.id);
      } catch (wsError) {
        console.error("WebSocket connection error:", wsError);
      }

      // Prime the live map immediately after loading order details
      try {
        await fetchLiveLocation(order.orderNumber);
      } catch (locError) {
        console.error("Initial live location fetch error:", locError);
      }

    } catch (err: any) {
      console.error("Tracking error:", err);
      if (err.response?.status === 404) {
        setTrackingData(null);
        setError('Order not found. Please check the tracking number.');
      } else {
        // Only set error if we don't have data already
        if (!trackingData) {
          setError('Unable to retrieve tracking information. Please try again.');
          toast.error('Tracking information unavailable');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleTrack = async () => {
    if (!validateTrackingNumber(trackingNumber)) {
      setError('Please enter a valid tracking number');
      return;
    }
    setIsLoading(true);
    setError(null);
    await fetchOrderDetails(trackingNumber);
  };

  const getStatusIcon = (item: TimelineEvent) => {
    if (item.completed) return CheckCircle;
    if (item.current) return Truck;
    return Clock;
  };

  const getStatusColor = (item: TimelineEvent) => {
    if (item.completed) return 'from-green-500 to-emerald-500';
    if (item.current) return 'from-primary to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusBadgeColor = (status: TrackingData['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500';
      case 'In Transit': return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500';
      case 'Out for Delivery': return 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:text-white dark:border-orange-500';
      case 'Exception': return 'bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white dark:border-red-400';
      default: return 'bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:text-white dark:border-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Track Your Order - ሀሴት Delivery"
        description="Track your package in real-time with ሀሴት Delivery. Get live updates and estimated delivery times."
        keywords="track package, delivery tracking, shipment status, ሀሴት delivery"
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center">
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Real-Time Package Tracking</span>
              </motion.div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Track Your Shipment
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Enter your tracking number below to get real-time updates on your package location and estimated delivery time.
              </p>

              {/* Tracking Input */}
              <Card3D>
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Enter tracking number (e.g., KRU123456789)"
                          value={trackingNumber}
                          onChange={(e) => {
                            setTrackingNumber(e.target.value);
                            setError(null);
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                          className="h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 focus:border-primary transition-colors duration-200"
                          disabled={isLoading}
                        />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Button
                          onClick={handleTrack}
                          disabled={!trackingNumber.trim() || isLoading}
                          size="lg"
                          className="h-12 px-8 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Package className="h-5 w-5" />
                            </motion.div>
                          ) : (
                            <>
                              <Search className="h-5 w-5 mr-2" />
                              Track Package
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </motion.div>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      Need help finding your tracking number? Check your email confirmation or contact support.
                    </p>
                  </div>
                </GlassCard>
              </Card3D>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tracking Results */}
      {trackingData && (
        <section className="py-16 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ETA Countdown - Show for orders in transit */}
            {(['Processing', 'In Transit', 'Out for Delivery'].includes(trackingData.status)) && (
              <ScrollReveal delay={0.05}>
                <div className="mb-6">
                  <ETACountdown orderNumber={trackingData.id} orderStatus={trackingData.status} />
                </div>
              </ScrollReveal>
            )}

            {/* Summary Card */}
            <ScrollReveal>
              <Card3D className="mb-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-6">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="text-white/80 text-sm font-medium">Tracking Number</div>
                        <div className="text-white text-xl font-mono font-semibold">
                          {trackingData.id}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="space-y-2">
                          <div className="text-white/80 text-sm font-medium">Current Status</div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(trackingData.status)}`}>
                              {trackingData.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-white/80 text-sm font-medium">Estimated Delivery</div>
                          <div className="text-white text-lg font-semibold">
                            {trackingData.estimatedDelivery}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="text-white/80 text-sm font-medium">Current Location</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {trackingData.currentLocation}
                      </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-white mt-8 mb-6">
                      Shipment Progress
                    </h2>

                    <div className="space-y-6">
                      {trackingData.timeline.map((item, index) => {
                        const StatusIcon = getStatusIcon(item);
                        const statusColor = getStatusColor(item);

                        return (
                          <motion.div
                            key={index}
                            className="relative flex gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {/* Timeline Line */}
                            {index < trackingData.timeline.length - 1 && (
                              <div
                                className={`absolute left-6 top-12 w-0.5 h-full ${item.completed ? 'bg-green-500' : 'bg-border/50'
                                  }`}
                              />
                            )}

                            {/* Icon */}
                            <motion.div
                              className={`relative z-10 bg-gradient-to-br ${statusColor} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}
                              animate={item.current ? {
                                scale: [1, 1.05, 1],
                              } : {}}
                              transition={{
                                duration: 2,
                                repeat: item.current ? Infinity : 0,
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <StatusIcon className="h-5 w-5 text-white" />
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1 pb-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                                <h3 className={`text-base font-medium ${item.completed || item.current ? 'text-white' : 'text-white/60'
                                  }`}>
                                  {item.status}
                                </h3>
                                <span className="text-sm text-white/60 font-medium">
                                  {item.time}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <MapPin className="h-3 w-3" />
                                <span>{item.location}</span>
                              </div>
                              {item.current && (
                                <motion.div
                                  className="mt-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-sm text-white font-medium inline-block"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  Current Location
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Live Map Button Section */}
                    {['Processing', 'In Transit', 'Out for Delivery'].includes(trackingData.status) && (
                      <div className="mt-8 border-t border-white/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-white/90">
                          <p className='font-semibold'>Live Tracking Available</p>
                          <span className='text-sm text-white/70'>See where your driver is right now</span>
                        </div>
                        <Button
                          onClick={fetchLiveLocation}
                          variant="secondary"
                          size="lg"
                          className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg min-w-[200px]"
                        >
                          <MapPin className="mr-2 h-5 w-5" />
                          View Live Map
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card3D>
            </ScrollReveal>

            {/* Live Map Section */}
            {trackingData.coordinates && (
              <ScrollReveal delay={0.1}>
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                    Live Location
                  </h2>
                  <div className="h-[400px] rounded-2xl overflow-hidden shadow-xl border border-border/50 bg-background">
                    <LiveTrackingMap
                      latitude={trackingData.coordinates.lat}
                      longitude={trackingData.coordinates.lng}
                      driverName={trackingData.deliveryInfo.driver}
                      pickup={trackingData.pickupCoordinates}
                      destination={trackingData.deliveryCoordinates}
                    />
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ScrollReveal delay={0.2}>
                <GlassCard className="p-6 h-full bg-background/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Package Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{trackingData.packageDetails.weight}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span className="font-medium">{trackingData.packageDetails.dimensions}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Service:</span>
                          <span className="font-medium text-primary">{trackingData.packageDetails.service}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <GlassCard className="p-6 h-full bg-background/50 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Delivery Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Driver:</span>
                          <span className="font-medium">{trackingData.deliveryInfo.driver}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Vehicle:</span>
                          <span className="font-medium">{trackingData.deliveryInfo.vehicle}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="font-medium">{trackingData.deliveryInfo.contact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>

            {/* Payment Section */}
            {trackingData.paymentRequired && (
              <ScrollReveal delay={0.4}>
                <Card3D>
                  <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-orange-600/10 border-primary/20">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-primary to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Payment Required
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            Complete your payment to confirm delivery schedule
                          </p>
                          <p className="text-xl font-bold text-primary">
                            ETB {trackingData.amount?.toLocaleString()}.00
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            toast.info('Payment reminder sent to your email');
                          }}
                        >
                          Remind Me Later
                        </Button>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Button
                            onClick={() => setPaymentModalOpen(true)}
                            size="lg"
                            className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Now
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </GlassCard>
                </Card3D>
              </ScrollReveal>
            )}

            {/* Delivery Proof Section */}
            {trackingData && trackingNumber && (
              <ScrollReveal delay={0.5}>
                <DeliveryProofComponent orderNumber={trackingNumber} />
              </ScrollReveal>
            )}

            {/* Chat Section - Show if order has driver assigned and user is logged in */}
            {trackingData && orderData && orderData.driver && orderData.driver.user && currentUserId && trackingNumber && orderData.customerId && (
              <ScrollReveal delay={0.6}>
                <Card className="border-border/50 shadow-md mb-6 relative z-10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        {currentUserId === orderData.customerId 
                          ? `Chat with ${orderData.driver.user.firstname} ${orderData.driver.user.lastname}`
                          : `Chat with Customer`
                        }
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChat(!showChat)}
                      >
                        {showChat ? 'Hide Chat' : 'Open Chat'}
                      </Button>
                    </div>
                  </CardHeader>
                  {showChat && (
                    <CardContent className="p-0">
                      <ChatWindow
                        orderNumber={trackingNumber}
                        currentUserId={currentUserId}
                        recipientId={currentUserId === orderData.customerId 
                          ? orderData.driver.user.id 
                          : orderData.customerId
                        }
                        recipientName={currentUserId === orderData.customerId
                          ? `${orderData.driver.user.firstname} ${orderData.driver.user.lastname}`
                          : 'Customer'
                        }
                      />
                    </CardContent>
                  )}
                </Card>
              </ScrollReveal>
            )}
          </div>
        </section>
      )}

      {/* Features Section - Show when no tracking data */}
      {!trackingData && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Advanced Tracking Features
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive tracking solutions for complete visibility of your shipments
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: MapPin,
                  title: 'Real-Time GPS Tracking',
                  description: 'Live location updates with precise GPS coordinates and route optimization',
                  gradient: 'from-green-500 to-emerald-500',
                },
                {
                  icon: Clock,
                  title: 'Automated Notifications',
                  description: 'Instant alerts for status changes, delays, and delivery milestones',
                  gradient: 'from-blue-500 to-cyan-500',
                },
                {
                  icon: Package,
                  title: 'Digital Proof of Delivery',
                  description: 'Secure electronic signatures and photo confirmation upon delivery',
                  gradient: 'from-purple-500 to-pink-500',
                },
              ].map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <Card3D>
                    <GlassCard className="p-6 h-full bg-background/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                      <motion.div
                        className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md`}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                      >
                        <feature.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </GlassCard>
                  </Card3D>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        orderDetails={{
          orderId: trackingData?.id || 'KRU123456789',
          amount: trackingData?.amount || 2500,
          items: ['Express Delivery Service', 'Package Insurance', 'Priority Handling']
        }}
        onSuccess={() => {
          setPaymentModalOpen(false);
          toast.success('Payment completed successfully! Your order will be delivered as scheduled.');
          if (trackingData) {
            setTrackingData({
              ...trackingData,
              paymentRequired: false
            });
          }
        }}
      />
    </div>
  );
}
