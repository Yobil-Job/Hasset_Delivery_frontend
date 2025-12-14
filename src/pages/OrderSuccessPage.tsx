import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Package, MapPin, ArrowRight, Truck, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { orderService, OrderResponse } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { toast } from 'sonner';

export function OrderSuccessPage() {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderNumber) return;
            try {
                const data = await orderService.getOrderByNumber(orderNumber);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order', error);
                toast.error('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderNumber]);

    const handlePayNow = async () => {
        if (!order || !order.id) return;
        
        setProcessingPayment(true);
        try {
            const response = await paymentService.initializePayment(order.id);
            // Redirect to Chapa checkout
            window.location.href = response.checkoutUrl;
        } catch (error: any) {
            console.error('Failed to initialize payment', error);
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.message || 
                                error.message || 
                                'Failed to initialize payment. Please ensure your phone number is valid and try again.';
            toast.error(errorMessage);
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Order not found</h1>
                <Link to="/order/create">
                    <Button>Create New Order</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4"
                            >
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
                            <p className="text-muted-foreground">
                                Your order <span className="font-mono font-medium text-primary">{order.orderNumber}</span> has been created successfully.
                            </p>
                        </div>

                        <Card className="border-border/50 shadow-lg overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="h-5 w-5 text-primary" />
                                    Order Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <div className="font-medium flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Total Price</span>
                                        <div className="font-bold text-xl text-primary">
                                            {order.price.toFixed(2)} ETB
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <MapPin className="h-4 w-4 text-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Pickup From</span>
                                            <p className="font-medium">{order.pickupAddress}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                                <MapPin className="h-4 w-4 text-orange-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Deliver To</span>
                                            <p className="font-medium">{order.deliveryAddress}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                    <div className="bg-muted/30 p-3 rounded-lg">
                                        <span className="text-xs text-muted-foreground block mb-1">Weight</span>
                                        <div className="font-medium flex items-center gap-1">
                                            <Package className="h-3 w-3" />
                                            {order.weightKg} kg
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-lg">
                                        <span className="text-xs text-muted-foreground block mb-1">Distance</span>
                                        <div className="font-medium flex items-center gap-1">
                                            <Truck className="h-3 w-3" />
                                            {order.distanceKm} km
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-8">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                {order.status === 'CREATED' && (
                                    <button
                                        onClick={handlePayNow}
                                        disabled={processingPayment}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 text-white border w-full sm:w-auto"
                                        style={{
                                            backgroundColor: '#16a34a',
                                            borderColor: '#15803d',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!processingPayment) {
                                                e.currentTarget.style.backgroundColor = '#15803d';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!processingPayment) {
                                                e.currentTarget.style.backgroundColor = '#16a34a';
                                            }
                                        }}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        {processingPayment ? 'Processing...' : 'Pay Now'}
                                    </button>
                                )}
                                <Link to="/order/create" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full">
                                        Create Another Order
                                    </Button>
                                </Link>
                                <Link to="/profile" className="w-full sm:w-auto">
                                    <Button className="w-full bg-primary hover:bg-primary/90">
                                        View My Orders
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
