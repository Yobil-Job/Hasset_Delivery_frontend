import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, LogOut, Package,
    Settings, CreditCard, ChevronRight, LayoutDashboard, TrendingUp,
    Clock, CheckCircle2, Truck, Calendar, DollarSign, Star, ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SEO } from '../components/global/SEO';
import { GlassCard } from '../components/global/GlassCard';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../services/auth';
import { analyticsService } from '../services/analyticsService';
import { orderService, OrderResponse } from '../services/orderService';
import { toast } from 'sonner';

interface UserProfile {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    accountType?: string;
    role: string;
}

type Tab = 'overview' | 'orders' | 'settings';

const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
        'CREATED': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        'CONFIRMED': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        'ASSIGNED': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        'PICKED_UP': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        'ON_THE_WAY': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        'DELIVERED': 'bg-green-500/10 text-green-600 dark:text-green-400',
        'CANCELLED': 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    return statusMap[status] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
};

const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [analytics, setAnalytics] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                
                // Fetch analytics
                try {
                    const analyticsData = await analyticsService.getAnalytics('month');
                    setAnalytics(analyticsData);
                } catch (error) {
                    console.error('Failed to fetch analytics', error);
                }
            } catch (error) {
                console.error('Failed to fetch user profile', error);
                toast.error('Failed to load profile');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchRecentOrders();
        }
    }, [activeTab]);

    const fetchRecentOrders = async () => {
        try {
            setOrdersLoading(true);
            const orders = await orderService.getMyOrders();
            setRecentOrders(orders.slice(0, 5)); // Show only 5 most recent
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
            navigate('/');
        }
    };

    const getInitials = (firstname: string, lastname: string) => {
        return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'orders', label: 'Recent Orders', icon: Package },
        { id: 'settings', label: 'Account', icon: Settings },
    ];

    return (
        <div 
            className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-background"
            style={{
                willChange: 'scroll-position',
                transform: 'translateZ(0)', // Force GPU acceleration for smooth scrolling
            }}
        >
            <SEO
                title="My Profile - ሀሴት Delivery"
                description="Manage your account, track orders, and view your delivery statistics."
            />

            <div className="max-w-7xl mx-auto">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <GlassCard className="p-8 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-background">
                                        {getInitials(user.firstname, user.lastname)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-background"></div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-foreground mb-2">
                                        {user.firstname} {user.lastname}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span>{user.email}</span>
                                        </div>
                                        {user.phoneNumber && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <span>{user.phoneNumber}</span>
                                            </div>
                                        )}
                                        {user.accountType && (
                                            <Badge variant="secondary" className="capitalize">
                                                {user.accountType}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/order/create')}
                                        className="bg-background/80"
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        New Order
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/analytics')}
                                        className="bg-background/80"
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Analytics
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div 
                        className="lg:col-span-3"
                        style={{
                            willChange: 'transform',
                            transform: 'translateZ(0)',
                        }}
                    >
                        <GlassCard className="p-6 sticky top-24">
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-primary/10 to-orange-500/10 text-primary shadow-sm'
                                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        }`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="ml-auto w-2 h-2 rounded-full bg-primary"
                                            />
                                        )}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 pt-8 border-t border-border/50">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Main Content */}
                    <div 
                        className="lg:col-span-9"
                        style={{
                            willChange: 'contents',
                            contentVisibility: 'auto',
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Statistics Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <GlassCard className="p-6 hover:shadow-lg transition-shadow group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {analytics?.totalOrders ?? 0}
                                                </p>
                                            </GlassCard>

                                            <GlassCard className="p-6 hover:shadow-lg transition-shadow group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                                        <DollarSign className="h-6 w-6" />
                                                    </div>
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {analytics?.totalSpent?.toFixed(2) ?? '0.00'} <span className="text-lg text-muted-foreground">ETB</span>
                                                </p>
                                            </GlassCard>

                                            <GlassCard className="p-6 hover:shadow-lg transition-shadow group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                                                        <Star className="h-6 w-6" />
                                                    </div>
                                                    {analytics?.averageOrderValue && (
                                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {analytics?.averageOrderValue?.toFixed(2) ?? '0.00'} <span className="text-lg text-muted-foreground">ETB</span>
                                                </p>
                                            </GlassCard>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Link to="/orders">
                                                <GlassCard className="p-6 hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-primary/20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-foreground">My Orders</p>
                                                            <p className="text-sm text-muted-foreground">View and track all your orders</p>
                                                        </div>
                                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                </GlassCard>
                                            </Link>
                                            <Link to="/analytics">
                                                <GlassCard className="p-6 hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-primary/20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                                                            <TrendingUp className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-foreground">Analytics</p>
                                                            <p className="text-sm text-muted-foreground">View your order statistics</p>
                                                        </div>
                                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                                                    </div>
                                                </GlassCard>
                                            </Link>
                                        </div>

                                        {/* Personal Information */}
                                        <GlassCard className="p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                                                <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
                                                    Edit Profile
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        Full Name
                                                    </label>
                                                    <p className="text-base font-medium text-foreground">{user.firstname} {user.lastname}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        Email Address
                                                    </label>
                                                    <p className="text-base font-medium text-foreground">{user.email}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        Phone Number
                                                    </label>
                                                    <p className="text-base font-medium text-foreground">{user.phoneNumber || 'Not provided'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        Address
                                                    </label>
                                                    <p className="text-base font-medium text-foreground">{user.address || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h1 className="text-2xl font-bold text-foreground">Recent Orders</h1>
                                                <p className="text-muted-foreground mt-1">Your latest delivery orders</p>
                                            </div>
                                            <Button onClick={() => navigate('/orders')} className="bg-gradient-to-r from-primary to-orange-600">
                                                View All Orders
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>

                                        {ordersLoading ? (
                                            <GlassCard className="p-12 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                                                <p className="text-muted-foreground">Loading orders...</p>
                                            </GlassCard>
                                        ) : recentOrders.length === 0 ? (
                                            <GlassCard className="p-12 text-center">
                                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                                    <Package className="h-8 w-8 text-primary" />
                                                </div>
                                                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                                                <p className="text-muted-foreground mb-6">
                                                    Start by creating your first delivery order.
                                                </p>
                                                <Button onClick={() => navigate('/order/create')} className="bg-gradient-to-r from-primary to-orange-600">
                                                    Create Your First Order
                                                </Button>
                                            </GlassCard>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentOrders.map((order) => (
                                                    <Link key={order.orderNumber} to={`/orders/${order.orderNumber}`}>
                                                        <GlassCard className="p-6 hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-primary/20">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <h3 className="font-semibold text-foreground">Order #{order.orderNumber}</h3>
                                                                        <Badge className={getStatusColor(order.status)}>
                                                                            {formatStatus(order.status)}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-2">
                                                                            <MapPin className="h-4 w-4" />
                                                                            <span className="truncate">{order.pickupAddress}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Truck className="h-4 w-4" />
                                                                            <span className="truncate">{order.deliveryAddress}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <DollarSign className="h-4 w-4" />
                                                                            <span className="font-medium text-foreground">{order.price.toFixed(2)} ETB</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                                            </div>
                                                        </GlassCard>
                                                    </Link>
                                                ))}
                                                <div className="pt-4">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => navigate('/orders')}
                                                    >
                                                        View All Orders
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
                                            <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
                                        </div>

                                        {/* Account Information */}
                                        <GlassCard className="p-8">
                                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                                <User className="h-5 w-5 text-primary" />
                                                Account Information
                                            </h3>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">First Name</label>
                                                        <p className="text-base font-medium text-foreground">{user.firstname}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                                                        <p className="text-base font-medium text-foreground">{user.lastname}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                                        <p className="text-base font-medium text-foreground">{user.email}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                                        <p className="text-base font-medium text-foreground">{user.phoneNumber || 'Not provided'}</p>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                                                        <p className="text-base font-medium text-foreground">{user.address || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>

                                        {/* Security */}
                                        <GlassCard className="p-8">
                                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                                <Settings className="h-5 w-5 text-primary" />
                                                Security
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                                    <div>
                                                        <p className="font-medium">Change Password</p>
                                                        <p className="text-sm text-muted-foreground">Update your account password</p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => navigate('/forgot-password')}
                                                    >
                                                        Change Password
                                                    </Button>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </div>
                                )}
                                <div className="h-24 md:h-32" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
