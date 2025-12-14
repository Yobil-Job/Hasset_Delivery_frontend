import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, MapPin, Calendar, ArrowLeft, Truck, DollarSign, Clock, RotateCcw, MessageCircle, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { orderService, OrderResponse } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ETACountdown } from '../components/order/ETACountdown';
import { DeliveryProofComponent } from '../components/order/DeliveryProof';
import { ChatWindow } from '../components/chat/ChatWindow';
import { authService } from '../services/auth';

export function OrderDetailsPage() {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!orderNumber) return;
            try {
                // Fetch current user
                const userData = await authService.getCurrentUser();
                setCurrentUserId(userData.id);
                
                // Fetch order
                const data = await orderService.getOrderByNumber(orderNumber);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order', error);
                toast.error('Failed to load order details');
                navigate('/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderNumber, navigate]);

    const handleReorder = async () => {
        if (!order || !orderNumber) return;

        setReordering(true);
        try {
            const response = await orderService.reorder(orderNumber);
            toast.success(`Order recreated! New order: ${response.newOrderNumber}`);
            
            // Navigate to create order page with pre-filled data
            navigate('/order/create', {
                state: {
                    reorderData: {
                        pickupAddress: order.pickupAddress,
                        pickupLat: order.pickupLatitude,
                        pickupLng: order.pickupLongitude,
                        deliveryAddress: order.deliveryAddress,
                        deliveryLat: order.deliveryLatitude,
                        deliveryLng: order.deliveryLongitude,
                        weightKg: order.weightKg.toString(),
                        serviceId: order.serviceOffering?.id?.toString() || ''
                    }
                }
            });
        } catch (error: any) {
            console.error('Failed to reorder', error);
            toast.error(error.response?.data?.error || 'Failed to reorder. Please try again.');
        } finally {
            setReordering(false);
        }
    };

    const handlePayNow = async () => {
        if (!order || !order.id) return;
        
        setProcessingPayment(true);
        try {
            const response = await paymentService.initializePayment(order.id);
            // Redirect to Chapa checkout
            window.location.href = response.checkoutUrl;
        } catch (error: any) {
            console.error('Failed to initialize payment', error);
            toast.error(error.response?.data?.error || 'Failed to initialize payment. Please try again.');
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-3">
                                    Order #{order.orderNumber}
                                    <Badge className={
                                        order.status === 'CREATED' ? 'bg-blue-500' :
                                            order.status === 'CONFIRMED' ? 'bg-green-500' :
                                                'bg-red-500'
                                    }>
                                        {order.status}
                                    </Badge>
                                </h1>
                                <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy at h:mm a')}
                                </p>
                            </div>
                        </div>

                        {/* ETA Countdown - Show for orders in transit */}
                        {order && (order.status === 'ON_THE_WAY' || order.status === 'PICKED_UP') && (
                            <div className="mb-6">
                                <ETACountdown orderNumber={order.orderNumber} orderStatus={order.status} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Route Card */}
                                <Card className="border-border/50 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            Delivery Route
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8 relative">
                                        {/* Connecting Line */}
                                        <div className="absolute left-[43px] top-[80px] bottom-[60px] w-0.5 bg-gradient-to-b from-primary to-orange-500 border-l-2 border-dashed border-primary/30"></div>

                                        <div className="flex gap-4 relative">
                                            <div className="mt-1 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background shadow-sm">
                                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium mb-1">Pickup Location</p>
                                                <p className="text-lg font-medium">{order.pickupAddress}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 relative">
                                            <div className="mt-1 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border-2 border-background shadow-sm">
                                                    <MapPin className="h-5 w-5 text-orange-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium mb-1">Delivery Destination</p>
                                                <p className="text-lg font-medium">{order.deliveryAddress}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Package Details */}
                                <Card className="border-border/50 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Package className="h-5 w-5 text-primary" />
                                            Package Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/30 p-4 rounded-xl">
                                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                    <Package className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Weight</span>
                                                </div>
                                                <p className="text-xl font-bold">{order.weightKg} kg</p>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-xl">
                                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                    <Truck className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Distance</span>
                                                </div>
                                                <p className="text-xl font-bold">{order.distanceKm} km</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Delivery Proof */}
                                {order && orderNumber && (
                                    <div className="mb-6">
                                        <DeliveryProofComponent orderNumber={orderNumber} />
                                    </div>
                                )}

                                {/* Chat Section - Show if order has driver assigned */}
                                {order && order.driver && order.driver.user && currentUserId && orderNumber && order.customerId && (
                                    <Card className="border-border/50 shadow-md mb-6 relative z-10">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <MessageCircle className="h-5 w-5 text-primary" />
                                                    {currentUserId === order.customerId 
                                                        ? `Chat with ${order.driver.user.firstname} ${order.driver.user.lastname}`
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
                                                    orderNumber={orderNumber}
                                                    currentUserId={currentUserId}
                                                    recipientId={currentUserId === order.customerId 
                                                        ? order.driver.user.id 
                                                        : order.customerId
                                                    }
                                                    recipientName={currentUserId === order.customerId
                                                        ? `${order.driver.user.firstname} ${order.driver.user.lastname}`
                                                        : 'Customer'
                                                    }
                                                />
                                            </CardContent>
                                        )}
                                    </Card>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Price Card */}
                                <Card className="border-border/50 shadow-md bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <DollarSign className="h-5 w-5 text-primary" />
                                            Payment Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Base Fee</span>
                                            <span>50.00 ETB</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Distance Fee</span>
                                            <span>{(order.distanceKm * 10).toFixed(2)} ETB</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Weight Fee</span>
                                            <span>{(Math.max(0, order.weightKg - 5) * 5).toFixed(2)} ETB</span>
                                        </div>
                                        <Separator className="bg-primary/20" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Total</span>
                                            <span className="text-2xl font-bold text-primary">{order.price.toFixed(2)} ETB</span>
                                        </div>
                                        {order.status === 'CREATED' && (
                                            <>
                                                <Separator className="bg-primary/20" />
                                                <Button 
                                                    onClick={handlePayNow}
                                                    disabled={processingPayment}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white border-green-700"
                                                >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    {processingPayment ? 'Processing...' : 'Pay Now'}
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Reorder Card - Show for delivered orders */}
                                {order.status === 'DELIVERED' && (
                                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <RotateCcw className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium mb-1">Reorder This Delivery</h3>
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        Create a new order with the same details. Price will be recalculated based on current rates.
                                                    </p>
                                                    <Button 
                                                        onClick={handleReorder}
                                                        disabled={reordering}
                                                        className="w-full bg-gradient-to-r from-primary to-orange-600 hover:opacity-90 text-white"
                                                    >
                                                        {reordering ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                                Creating Order...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <RotateCcw className="h-4 w-4" />
                                                                Reorder
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Support Card */}
                                <Card className="border-border/50 shadow-sm">
                                    <CardContent className="p-6">
                                        <h3 className="font-medium mb-2">Need Help?</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Having trouble with this order? Contact our support team.
                                        </p>
                                        <Button variant="outline" className="w-full">
                                            Contact Support
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
