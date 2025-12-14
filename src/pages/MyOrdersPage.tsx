import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, MapPin, Calendar, ChevronRight, Search, Filter, Copy, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { orderService, OrderResponse, OrderFilters } from '../services/orderService';
import { pricingService, ServiceOffering } from '../services/pricing';
import { OrderFilters as OrderFiltersComponent } from '../components/order/OrderFilters';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [allOrders, setAllOrders] = useState<OrderResponse[]>([]); // Store all orders for price range calculation
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [filters, setFilters] = useState<OrderFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [services, setServices] = useState<ServiceOffering[]>([]);

    // Fetch services for filter
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await pricingService.getServices();
                setServices(data);
            } catch (error) {
                console.error('Failed to fetch services', error);
            }
        };
        fetchServices();
    }, []);

    // Calculate price range from all orders
    const priceRange = allOrders.length > 0
        ? {
            min: Math.floor(Math.min(...allOrders.map(o => o.price))),
            max: Math.ceil(Math.max(...allOrders.map(o => o.price)))
        }
        : { min: 0, max: 1000 };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // First fetch all orders to calculate price range
                const allData = await orderService.getMyOrders();
                setAllOrders(allData);

                // Then fetch filtered orders
                const data = await orderService.getMyOrders(filters);
                // Sort by date descending (newest first)
                const sorted = data.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setOrders(sorted);
            } catch (error) {
                console.error('Failed to fetch orders', error);
                toast.error('Failed to load your orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [filters]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        toast.success('Order number copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED': return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500';
            case 'CONFIRMED': return 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500';
            case 'CANCELLED': return 'bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white dark:border-red-400';
            default: return 'bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:text-white dark:border-slate-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                                My Orders
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Track and manage your delivery history
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search orders..."
                                    className="pl-10 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button 
                                variant={showFilters ? "default" : "outline"} 
                                size="icon"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <OrderFiltersComponent
                                filters={filters}
                                onFiltersChange={setFilters}
                                services={services}
                                priceRange={priceRange}
                            />
                        </motion.div>
                    )}

                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                You haven't placed any orders yet. Create your first shipment today!
                            </p>
                            <Link to="/order/create">
                                <Button size="lg" className="bg-gradient-to-r from-primary to-orange-600">
                                    Create New Order
                                </Button>
                            </Link>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground">
                                {searchTerm 
                                    ? `No orders found matching "${searchTerm}"`
                                    : Object.keys(filters).length > 0
                                    ? "No orders match the selected filters"
                                    : "No orders found"}
                            </p>
                            {(searchTerm || Object.keys(filters).length > 0) && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilters({});
                                    }}
                                >
                                    Clear Search & Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredOrders.map((order, index) => (
                                <motion.div
                                    key={order.orderNumber}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm group">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                                {/* Order Info */}
                                                <div className="flex items-start gap-4">
                                                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                                                        <Package className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-mono font-bold text-lg">
                                                                {order.orderNumber}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleCopy(order.orderNumber);
                                                                }}
                                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                                title="Copy Order Number"
                                                            >
                                                                {copiedId === order.orderNumber ? (
                                                                    <Check className="h-4 w-4 text-green-500" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <Badge variant="outline" className={`${getStatusColor(order.status)} border`}>
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="font-medium text-foreground">
                                                                {order.price.toFixed(2)} ETB
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Locations */}
                                                <div className="flex-1 md:px-8 w-full md:w-auto">
                                                    <div className="flex gap-3 h-full">
                                                        {/* Timeline Visuals */}
                                                        <div className="flex flex-col items-center pt-1.5">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>
                                                            <div className="w-0.5 flex-grow bg-border/50 my-1"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></div>
                                                        </div>

                                                        {/* Addresses */}
                                                        <div className="flex flex-col justify-between gap-4">
                                                            <div>
                                                                <p className="text-sm font-medium line-clamp-1">{order.pickupAddress}</p>
                                                                <p className="text-xs text-muted-foreground">Pickup</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium line-clamp-1">{order.deliveryAddress}</p>
                                                                <p className="text-xs text-muted-foreground">Delivery</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <Link to={`/orders/${order.orderNumber}`}>
                                                    <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                                                        View Details
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
