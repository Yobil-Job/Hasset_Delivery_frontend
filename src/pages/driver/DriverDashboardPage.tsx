import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import api from '@/utils/api';
import {
    MapPin,
    Navigation,
    CheckCircle,
    Truck,
    Package,
    LogOut,
    Activity,
    Bell,
    LineChart,
    History,
    WifiOff,
    Wifi,
    Menu,
    X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/global/ThemeToggle';
import { DeliveryProofComponent } from '@/components/order/DeliveryProof';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageCircle } from 'lucide-react';
import { authService } from '@/services/auth';
import { motion, AnimatePresence } from 'motion/react';
import { DriverDeliveriesSection } from '@/components/driver/DriverDeliveriesSection';
import { DriverEarningsSection } from '@/components/driver/DriverEarningsSection';
import { DriverProfileSection } from '@/components/driver/DriverProfileSection';
import { DriverSettingsSection } from '@/components/driver/DriverSettingsSection';

interface Order {
    id: number;
    orderNumber: string;
    pickupAddress: string;
    deliveryAddress: string;
    status: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    weightKg: number;
    price: number;
    customerPhone?: string;
    customerId?: number;
    customer?: {
        id: number;
        firstname: string;
        lastname: string;
    };
}

export function DriverDashboardPage() {
    const navigate = useNavigate();
    const [driverId, setDriverId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [allOrders, setAllOrders] = useState<Order[]>([]);

    // Enhanced Tracking State
    const [trackingStatus, setTrackingStatus] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
    const [trackingError, setTrackingError] = useState<string | null>(null);

    // Debug Stats
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'sending'>('connected');
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
    const [speed, setSpeed] = useState<number | null>(null);

    const watchId = useRef<number | null>(null);
    const hasShownActiveToast = useRef<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'deliveries' | 'earnings' | 'profile' | 'settings'>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    // Earnings / stats derived from allOrders
    const [todayEarnings, setTodayEarnings] = useState<number>(0);
    const [weekEarnings, setWeekEarnings] = useState<number>(0);
    const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
    const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [showChat, setShowChat] = useState(false);

    const handleLogout = () => {
        setDriverId('');
        setActiveOrder(null);
        stopTracking();
        navigate('/login');
    };

    const fetchActiveOrder = async () => {
        try {
            const response = await api.get('/orders/active-order');

            if (response.status === 204 || !response.data) {
                setActiveOrder(null);
                return;
            }

            const myOrder = response.data;
            setActiveOrder(myOrder);

            // Auto-set driver ID if available
            if (myOrder.driver && myOrder.driver.id) {
                setDriverId(myOrder.driver.id.toString());
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Error fetching active order:', error);
        }
    };

    const fetchDriverOrders = async () => {
        try {
            // Use the driver-specific endpoint to get all driver orders
            const response = await api.get('/orders/my-orders');
            const orders: any[] = response.data || [];
            setAllOrders(orders as Order[]);
        } catch (error: any) {
            console.error('Failed to load driver orders', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                'Failed to load your orders. Please refresh the page.';
            toast.error(errorMessage);
        }
    };

    const updateOrderStatus = async (status: string) => {
        if (!activeOrder) return;
        try {
            if (status === 'ON_THE_WAY') {
                // Ensure driver is online before starting journey
                if (!isOnline) {
                    setIsOnline(true);
                    toast.info('You are now ONLINE. Starting GPS tracking...');
                }
                await api.post(`/orders/${activeOrder.id}/start-journey`);
            } else if (status === 'DELIVERED') {
                await api.post(`/orders/${activeOrder.id}/complete`);
            } else {
                await api.patch(`/orders/${activeOrder.orderNumber}/status`, { status });
            }

            toast.success(`Order status updated to ${status}`);
            await fetchActiveOrder();

            if (status === 'ON_THE_WAY') {
                // Small delay to ensure order is updated, then start tracking
                setTimeout(() => {
                startTracking();
                }, 500);
            } else if (status === 'DELIVERED') {
                stopTracking();
            }

        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Failed to update status');
        }
    };

    const startTracking = () => {
        // Ensure we have a valid driver identifier to associate GPS updates with
        if (!driverId) {
            if (activeOrder && (activeOrder as any).driver?.id) {
                const resolvedId = (activeOrder as any).driver.id.toString();
                setDriverId(resolvedId);
            } else {
                setTrackingStatus('error');
                const message = 'Cannot start tracking: missing Driver ID. Make sure you have an active assigned order.';
                setTrackingError(message);
                toast.error(message);
                return;
            }
        }
        if (!navigator.geolocation) {
            setTrackingStatus('error');
            setTrackingError("Geolocation is not supported by your browser");
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        // Set status to 'requesting' IMMEDIATELY (before async call)
        setTrackingStatus('requesting');
        setTrackingError(null);
        hasShownActiveToast.current = false; // Reset toast flag
        toast.info("Requesting GPS permission...");

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                const speedMps = position.coords.speed; // meters per second, can be null

                // First successful position - change status to 'active' (ONLY ONCE)
                if (trackingStatus !== 'active' && !hasShownActiveToast.current) {
                    setTrackingStatus('active');
                    toast.success("GPS Tracking Active!");
                    hasShownActiveToast.current = true; // Mark toast as shown
                }

                setGpsAccuracy(accuracy);
                setSpeed(speedMps);
                setCurrentLocation({ lat, lng });
                setRoutePoints((prev) => [...prev, { lat, lng }]);

                // Only send live updates when driver is ONLINE
                if (!isOnline) {
                    setConnectionStatus('connected');
                    return;
                }

                setConnectionStatus('sending');

                // Send update to backend
                try {
                    await api.post('/location', {
                        latitude: lat,
                        longitude: lng,
                        deviceId: driverId
                    });
                    setConnectionStatus('connected');
                    setLastUpdate(new Date());
                } catch (error) {
                    console.error('Failed to send location update', error);
                    setConnectionStatus('error');
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setTrackingStatus('error');

                // Comprehensive error handling with specific messages
                let errorMessage = "GPS Error";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied. Please allow location access in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable. Please check your device's GPS settings.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMessage = "An unknown error occurred while accessing your location.";
                }

                setTrackingError(errorMessage);
                toast.error(errorMessage);
            },
            options
        );
    };

    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setTrackingStatus('idle');
        setTrackingError(null);
        setSpeed(null);
        setGpsAccuracy(null);
        setRoutePoints([]);
    };

    useEffect(() => {
        fetchActiveOrder();
        // Fetch current user for chat/profile
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setCurrentUserId(userData.id);
                setCurrentUser(userData);
                // Use authenticated user ID as driver identifier when possible
                if (!driverId && userData.id) {
                    setDriverId(userData.id.toString());
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };
        fetchUser();
        return () => stopTracking();
    }, []);

    // Auto-restart tracking if order is ON_THE_WAY (handles page reload)
    useEffect(() => {
        if (activeOrder && activeOrder.status === 'ON_THE_WAY' && trackingStatus === 'idle') {
            startTracking();
        }
    }, [activeOrder]);

    // Recompute earnings / stats when orders or driverId change
    useEffect(() => {
        if (!allOrders.length) {
            setTodayEarnings(0);
            setWeekEarnings(0);
            setTotalDeliveries(0);
            setTotalDistanceKm(0);
            return;
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 6);

        let today = 0;
        let week = 0;
        let deliveries = 0;
        let distanceSum = 0;

        const toRad = (value: number) => (value * Math.PI) / 180;

        allOrders.forEach((order: any) => {
            if (order.status !== 'DELIVERED') return;
            deliveries += 1;

            const createdAt = order.createdAt ? new Date(order.createdAt) : null;
            if (createdAt && createdAt >= startOfToday) {
                today += order.price || 0;
            }
            if (createdAt && createdAt >= startOfWeek) {
                week += order.price || 0;
            }

            if (order.pickupLatitude && order.pickupLongitude && order.deliveryLatitude && order.deliveryLongitude) {
                const R = 6371;
                const dLat = toRad(order.deliveryLatitude - order.pickupLatitude);
                const dLon = toRad(order.deliveryLongitude - order.pickupLongitude);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(order.pickupLatitude)) *
                        Math.cos(toRad(order.deliveryLatitude)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                distanceSum += R * c;
            }
        });

        setTodayEarnings(today);
        setWeekEarnings(week);
        setTotalDeliveries(deliveries);
        setTotalDistanceKm(distanceSum);
    }, [allOrders]);

    // Keep driver orders in sync when driverId or currentUserId changes
    useEffect(() => {
        if (currentUserId || driverId) {
            fetchDriverOrders();
        }
    }, [currentUserId, driverId]);
    
    // Also refresh orders periodically and after status updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentUserId || driverId) {
                fetchDriverOrders();
            }
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(interval);
    }, [currentUserId, driverId]);

    // React to work mode changes
    useEffect(() => {
        if (!activeOrder || activeOrder.status !== 'ON_THE_WAY') return;

        if (isOnline && trackingStatus === 'idle') {
            startTracking();
        }

        if (!isOnline && trackingStatus === 'active') {
            stopTracking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, activeOrder?.status]);

    const toggleOnlineStatus = () => {
        setIsOnline((prev) => !prev);
        if (!isOnline) {
            toast.success('You are now ONLINE. Location updates will be sent when journey is started.');
        } else {
            toast('You are now OFFLINE. Live GPS updates are paused.');
        }
    };

    const deliveredOrders = allOrders.filter((o: any) => o.status === 'DELIVERED');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Truck },
        { id: 'deliveries', label: 'My Deliveries', icon: Package },
        { id: 'earnings', label: 'Earnings', icon: LineChart },
        { id: 'profile', label: 'Profile', icon: History },
        { id: 'settings', label: 'Settings', icon: Bell },
    ] as const;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="lg:hidden"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary to-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/30">
                            <Truck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-lg font-semibold tracking-tight">Driver Console</h1>
                                <Badge
                                    variant="outline"
                                        className="text-xs rounded-full px-3 py-0.5"
                                >
                                    ID {driverId || 'N/A'}
                                </Badge>
                            </div>
                                <p className="text-xs text-muted-foreground">
                                Monitor trips, earnings, and notifications in one place.
                            </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleOnlineStatus}
                            className={`hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                                    isOnline
                                    ? 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/60'
                                    : 'bg-muted text-muted-foreground border-border'
                                }`}
                            >
                                {isOnline ? (
                                    <>
                                        <Wifi className="w-3 h-3" /> Online
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-3 h-3" /> Offline
                                    </>
                                )}
                            </button>

                            <Badge
                            variant="outline"
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wide"
                            >
                                <Activity className="w-3 h-3" />
                                {trackingStatus === 'active'
                                    ? 'GPS streaming'
                                    : trackingStatus === 'requesting'
                                    ? 'Requesting GPS'
                                    : trackingStatus === 'error'
                                    ? 'GPS error'
                                    : 'GPS idle'}
                            </Badge>

                        <ThemeToggle />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-57px)]">
                {/* Desktop Sidebar (always visible on md+ screens) */}
                <aside className="hidden md:flex md:flex-col w-64 bg-card border-r border-border">
                    <div className="h-[calc(100vh-57px)] sticky top-[57px]">
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-semibold">
                                    {driverId ? `D${driverId}`.slice(0, 2).toUpperCase() : 'DR'}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">Driver Console</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Driver ID: {driverId || 'N/A'}
                                    </p>
                    </div>
                </div>
            </div>

                        <nav className="p-4 space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                        activeTab === item.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Mobile Sidebar (slides over content) */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                            className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border overflow-y-auto z-40 md:hidden"
                        >
                            <div className="p-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-semibold">
                                        {driverId ? `D${driverId}`.slice(0, 2).toUpperCase() : 'DR'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">Driver Console</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Driver ID: {driverId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <nav className="p-4 space-y-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                            activeTab === item.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 px-4 py-6 lg:pl-6 overflow-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                {/* Top summary row */}
                <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border border-border bg-card">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">Today&apos;s Earnings</CardTitle>
                                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 p-1">
                                        <LineChart className="w-4 h-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                                    <div className="text-2xl font-semibold">{todayEarnings.toFixed(2)} ETB</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Completed deliveries from midnight until now.
                                    </p>
                        </CardContent>
                    </Card>

                            <Card className="border border-border bg-card">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                                    <span className="inline-flex items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 p-1">
                                        <History className="w-4 h-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                                    <div className="text-2xl font-semibold">{weekEarnings.toFixed(2)} ETB</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                {totalDeliveries} completed deliveries • {totalDistanceKm.toFixed(1)} km total.
                            </p>
                        </CardContent>
                    </Card>

                            <Card className="border border-border bg-card">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium">Performance Snapshot</CardTitle>
                                    <span className="inline-flex items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 p-1">
                                        <Activity className="w-4 h-4" />
                            </span>
                        </CardHeader>
                        <CardContent>
                                    <div className="flex items-end justify-between text-xs text-muted-foreground">
                                <div>
                                            <p className="text-[11px] uppercase">Rating</p>
                                            <p className="text-lg font-semibold text-foreground">4.9</p>
                                            <p className="text-[11px] text-muted-foreground">Based on {totalDeliveries} deliveries</p>
                                </div>
                                <div className="flex gap-1 items-end h-12">
                                            <div className="w-1.5 rounded-full bg-emerald-500/30 h-6" />
                                    <div className="w-1.5 rounded-full bg-emerald-400/60 h-9" />
                                    <div className="w-1.5 rounded-full bg-emerald-300/80 h-10" />
                                    <div className="w-1.5 rounded-full bg-emerald-400/60 h-8" />
                                            <div className="w-1.5 rounded-full bg-emerald-500/30 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                        {/* Main sections */}
                        <Tabs value={activeTab} className="space-y-4">

                    {/* LIVE DASHBOARD TAB */}
                    <TabsContent value="dashboard" className="space-y-4">
                        {/* GPS requesting banner */}
                        {trackingStatus === 'requesting' && (
                            <Card className="border-amber-400/40 bg-amber-500/10 text-amber-50">
                                <CardContent className="py-3 flex items-start gap-3">
                                    <div className="mt-0.5 text-lg">⚠️</div>
                                    <div>
                                        <p className="font-semibold text-amber-100 text-sm">Requesting GPS permission</p>
                                        <p className="text-xs text-amber-100/80">
                                            Please allow location access in your browser popup so customers can track your
                                            journey.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Error Alert */}
                        {trackingStatus === 'error' && trackingError && (
                            <Card className="border-red-500/40 bg-red-500/10 text-red-50">
                                <CardContent className="py-3 flex items-start gap-3">
                                    <div className="mt-0.5 text-lg">⚠️</div>
                                    <div>
                                        <p className="font-semibold text-red-100 text-sm">GPS Tracking Error</p>
                                        <p className="text-xs text-red-100/80">{trackingError}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
                            {/* Active order and journey controls */}
                            <div className="space-y-4">
                                {activeOrder ? (
                                    <Card className="border border-border bg-card shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-center">
                                                <span className="flex items-center gap-2">
                                                    <Package className="w-5 h-5 text-primary" />
                                                    <span className="font-mono text-sm">#{activeOrder.orderNumber}</span>
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs sm:text-sm bg-primary/10 text-primary border-primary/30"
                                                >
                                                    {activeOrder.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl border border-border bg-muted/40">
                                                    <div className="flex items-center text-muted-foreground mb-1">
                                                        <MapPin className="w-4 h-4 mr-2" /> Pickup
                                                    </div>
                                                    <p className="font-medium text-sm sm:text-base text-foreground">
                                                        {activeOrder.pickupAddress}
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl border border-border bg-muted/40">
                                                    <div className="flex items-center text-muted-foreground mb-1">
                                                        <Navigation className="w-4 h-4 mr-2" /> Delivery
                                                    </div>
                                                    <p className="font-medium text-sm sm:text-base text-foreground">
                                                        {activeOrder.deliveryAddress}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-3 rounded-xl bg-muted/40 border border-border">
                                                    <p className="text-xs text-muted-foreground">Weight</p>
                                                    <p className="font-semibold text-sm sm:text-base text-foreground">
                                                        {activeOrder.weightKg} kg
                                                    </p>
                                                </div>
                                                <div className="text-center p-3 rounded-xl bg-muted/40 border border-border">
                                                    <p className="text-xs text-muted-foreground">Price</p>
                                                    <p className="font-semibold text-sm sm:text-base text-foreground">
                                                        {activeOrder.price} ETB
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                                                {activeOrder.status === 'ASSIGNED' && (
                                                    <button
                                                        className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-11 px-4 py-2 text-white border shadow-lg"
                                                        style={{
                                                            backgroundColor: '#16a34a',
                                                            borderColor: '#15803d',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#15803d';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#16a34a';
                                                        }}
                                                        onClick={() => updateOrderStatus('PICKED_UP')}
                                                    >
                                                        <Package className="w-4 h-4" /> Confirm Pickup
                                                    </button>
                                                )}

                                                {activeOrder.status === 'PICKED_UP' && (
                                                    <button
                                                        className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-11 px-4 py-2 text-white border shadow-lg"
                                                        style={{
                                                            backgroundColor: '#16a34a',
                                                            borderColor: '#15803d',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#15803d';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#16a34a';
                                                        }}
                                                        onClick={() => updateOrderStatus('ON_THE_WAY')}
                                                    >
                                                        <Truck className="w-4 h-4" /> Start Journey
                                                    </button>
                                                )}

                                                {activeOrder.status === 'ON_THE_WAY' && (
                                                    <div className="w-full space-y-4">
                                                        <div className="p-4 rounded-xl bg-blue-500/10 text-blue-200 flex items-center justify-between border border-blue-400/40 text-xs sm:text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-blue-300 animate-pulse" />
                                                                Live Tracking Active
                                                            </div>
                                                            <span className="text-blue-200/80 font-mono text-[11px]">
                                                                {routePoints.length} points captured
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-11 px-4 py-2 text-white border shadow-lg"
                                                            style={{
                                                                backgroundColor: '#16a34a',
                                                                borderColor: '#15803d',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#15803d';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#16a34a';
                                                            }}
                                                            onClick={() => updateOrderStatus('DELIVERED')}
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Complete Delivery
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {currentLocation && (
                                                <div className="text-xs text-muted-foreground text-center mt-2 font-mono">
                                                    GPS: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="border-dashed border-2 border-border bg-card shadow-none">
                                        <CardContent className="py-10 text-center text-muted-foreground space-y-3">
                                            <Package className="w-12 h-12 mx-auto mb-1 opacity-40 text-muted-foreground" />
                                            <p>No active orders assigned to Driver {driverId || 'N/A'}.</p>
                                            <Button
                                                variant="outline"
                                                onClick={fetchActiveOrder}
                                                className="border-border text-foreground hover:bg-muted"
                                            >
                                                Refresh Orders
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Delivery Proof - Show for active orders */}
                                {activeOrder && activeOrder.orderNumber && (
                                    <DeliveryProofComponent 
                                        orderNumber={activeOrder.orderNumber} 
                                        isDriver={true}
                                    />
                                )}

                                {/* Chat Section - Show if order has customer */}
                                {activeOrder && activeOrder.orderNumber && currentUserId && (activeOrder.customerId || (activeOrder as any).customer?.id) && (
                                    <Card className="border border-border bg-card shadow-sm">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                                    <MessageCircle className="h-5 w-5 text-primary" />
                                                    Chat with Customer
                                                </CardTitle>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowChat(!showChat)}
                                                    className="border-border text-foreground hover:bg-muted"
                                                >
                                                    {showChat ? 'Hide Chat' : 'Open Chat'}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        {showChat && (
                                            <CardContent className="p-0">
                                                <ChatWindow
                                                    orderNumber={activeOrder.orderNumber}
                                                    currentUserId={currentUserId}
                                                    recipientId={activeOrder.customerId || (activeOrder as any).customer?.id}
                                                    recipientName={(activeOrder as any).customer 
                                                        ? `${(activeOrder as any).customer.firstname} ${(activeOrder as any).customer.lastname}`
                                                        : 'Customer'
                                                    }
                                                />
                                            </CardContent>
                                        )}
                                    </Card>
                                )}
                            </div>

                            {/* Work mode and tracking debug */}
                            <div className="space-y-4">
                                    <Card className="border border-border bg-card">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-sm font-medium text-foreground">Work Mode</CardTitle>
                                        <Badge
                                            className={`text-[10px] uppercase tracking-wide border rounded-full px-2 py-0.5 ${
                                                isOnline
                                                    ? 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500'
                                                    : 'bg-slate-600 text-white border-slate-700 dark:bg-slate-500 dark:text-white dark:border-slate-400'
                                            }`}
                                        >
                                            {isOnline ? 'Online' : 'Offline'}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-xs text-muted-foreground">
                                        <p>
                                            When <span className="font-semibold text-foreground">Online</span>, your GPS updates are sent to
                                            the server during active journeys so customers can see your live route.
                                        </p>
                                        <Button
                                            variant={isOnline ? 'outline' : 'default'}
                                            size="sm"
                                            className={
                                                isOnline
                                                    ? 'w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-500/10'
                                                    : 'w-full bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
                                            }
                                            onClick={toggleOnlineStatus}
                                        >
                                            {isOnline ? (
                                                <>
                                                    <WifiOff className="w-4 h-4 mr-1" /> Go Offline
                                                </>
                                            ) : (
                                                <>
                                                    <Wifi className="w-4 h-4 mr-1" /> Go Online
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-400/40 bg-emerald-500/10 text-emerald-50 dark:bg-emerald-500/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Live Tracking Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-1">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                            <div>
                                                <p className="text-emerald-100/80 text-[11px]">Status</p>
                                                <p className="font-semibold text-emerald-50">
                                                    {trackingStatus === 'active'
                                                        ? 'Tracking Active'
                                                        : trackingStatus === 'requesting'
                                                        ? 'Requesting GPS'
                                                        : trackingStatus === 'error'
                                                        ? 'Error'
                                                        : 'Idle'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-emerald-100/80 text-[11px]">GPS Accuracy</p>
                                                <p className="font-mono text-xs">
                                                    {gpsAccuracy ? `±${Math.round(gpsAccuracy)}m` : 'Calculating...'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-emerald-100/80 text-[11px]">Speed</p>
                                                <p className="font-mono text-xs">
                                                    {speed !== null && speed !== undefined
                                                        ? `${(speed * 3.6).toFixed(1)} km/h`
                                                        : '0 km/h'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-emerald-100/80 text-[11px]">Server</p>
                                                <p
                                                    className={`font-semibold text-xs ${
                                                        connectionStatus === 'connected'
                                                            ? 'text-emerald-200'
                                                            : connectionStatus === 'error'
                                                            ? 'text-red-200'
                                                            : 'text-amber-200'
                                                    }`}
                                                >
                                                    {connectionStatus === 'connected'
                                                        ? 'Connected'
                                                        : connectionStatus === 'error'
                                                        ? 'Failed'
                                                        : 'Sending...'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-emerald-100/80 text-[11px]">Last Update</p>
                                                <p className="font-mono text-[11px]">
                                                    {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Waiting...'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-emerald-100/80 text-[11px]">Route Points</p>
                                                <p className="font-mono text-xs">{routePoints.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                            {/* DELIVERIES TAB */}
                            <TabsContent value="deliveries" className="space-y-4">
                                <DriverDeliveriesSection orders={allOrders} />
                    </TabsContent>

                            {/* EARNINGS TAB */}
                            <TabsContent value="earnings" className="space-y-4">
                                <DriverEarningsSection
                                    todayEarnings={todayEarnings}
                                    weekEarnings={weekEarnings}
                                    totalDeliveries={totalDeliveries}
                                    orders={allOrders}
                                />
                            </TabsContent>

                            {/* PROFILE TAB */}
                            <TabsContent value="profile" className="space-y-4">
                                <DriverProfileSection user={currentUser} totalDeliveries={totalDeliveries} />
                    </TabsContent>

                            {/* SETTINGS TAB */}
                            <TabsContent value="settings" className="space-y-4">
                                <DriverSettingsSection />
                    </TabsContent>
                </Tabs>
                    </div>
            </main>
            </div>
        </div>
    );
}
