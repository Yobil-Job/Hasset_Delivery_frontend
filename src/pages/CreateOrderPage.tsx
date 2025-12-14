import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, MapPin, Truck, Weight, Calculator, Loader2, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { pricingService, ServiceOffering, PriceCalculationResponse } from '../services/pricing';
import { orderService } from '../services/orderService';
import { LocationSearch } from '../components/global/LocationSearch';

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

export function CreateOrderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<ServiceOffering[]>([]);
    const [calculating, setCalculating] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
    const [priceBreakdown, setPriceBreakdown] = useState<PriceCalculationResponse | null>(null);
    const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Get reorder data from navigation state
    const reorderData = (location.state as any)?.reorderData;

    const [formData, setFormData] = useState({
        pickupAddress: reorderData?.pickupAddress || '',
        pickupLat: reorderData?.pickupLat || 0,
        pickupLng: reorderData?.pickupLng || 0,
        deliveryAddress: reorderData?.deliveryAddress || '',
        deliveryLat: reorderData?.deliveryLat || 0,
        deliveryLng: reorderData?.deliveryLng || 0,
        weightKg: reorderData?.weightKg || '',
        serviceId: reorderData?.serviceId || ''
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await pricingService.getServices();
                setServices(data);
            } catch (error) {
                console.error('Failed to fetch services', error);
                toast.error('Failed to load services');
            }
        };
        fetchServices();
    }, []);

    // Show toast when reorder data is loaded
    useEffect(() => {
        if (reorderData) {
            toast.success('Order details pre-filled. You can modify any field before submitting.');
        }
    }, [reorderData]);

    // Auto-calculate price when relevant fields change
    useEffect(() => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Check if all required fields are filled
        const hasWeight = formData.weightKg && parseFloat(formData.weightKg) > 0;
        const hasLocations = formData.pickupLat !== 0 && formData.pickupLng !== 0 && 
                            formData.deliveryLat !== 0 && formData.deliveryLng !== 0;
        const hasService = formData.serviceId !== '';

        if (!hasWeight || !hasLocations || !hasService) {
            // Reset price if required fields are missing
            setEstimatedPrice(null);
            setPriceBreakdown(null);
            setCalculatedDistance(null);
            return;
        }

        // Calculate distance
        const distance = calculateDistance(
            formData.pickupLat,
            formData.pickupLng,
            formData.deliveryLat,
            formData.deliveryLng
        );
        setCalculatedDistance(distance);

        // Debounce the API call (500ms delay)
        debounceTimerRef.current = setTimeout(async () => {
            setCalculating(true);
            try {
                const result = await pricingService.calculatePrice(
                    parseFloat(formData.weightKg),
                    formData.pickupLat,
                    formData.pickupLng,
                    formData.deliveryLat,
                    formData.deliveryLng,
                    parseInt(formData.serviceId)
                );
                setEstimatedPrice(result.total);
                setPriceBreakdown(result);
            } catch (error) {
                console.error('Auto-calculation failed', error);
                // Don't show toast for auto-calculation failures to avoid spam
                setEstimatedPrice(null);
                setPriceBreakdown(null);
            } finally {
                setCalculating(false);
            }
        }, 500);

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [formData.weightKg, formData.pickupLat, formData.pickupLng, formData.deliveryLat, formData.deliveryLng, formData.serviceId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleCalculate = async () => {
        if (!formData.weightKg || !formData.serviceId || !formData.pickupLat || !formData.deliveryLat) {
            toast.error('Please fill in weight, locations and select a service');
            return;
        }

        setCalculating(true);
        try {
            const result = await pricingService.calculatePrice(
                parseFloat(formData.weightKg),
                formData.pickupLat,
                formData.pickupLng,
                formData.deliveryLat,
                formData.deliveryLng,
                parseInt(formData.serviceId)
            );
            setEstimatedPrice(result.total);
            setPriceBreakdown(result);
            toast.success(`Estimated Price: ${result.total.toFixed(2)} ETB`);
        } catch (error) {
            console.error('Calculation failed', error);
            toast.error('Failed to calculate price');
        } finally {
            setCalculating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.pickupLat || !formData.deliveryLat) {
            toast.error('Please select valid locations from the suggestions');
            setLoading(false);
            return;
        }

        try {
            const order = await orderService.createOrder({
                pickupAddress: formData.pickupAddress,
                pickupLatitude: formData.pickupLat,
                pickupLongitude: formData.pickupLng,
                deliveryAddress: formData.deliveryAddress,
                deliveryLatitude: formData.deliveryLat,
                deliveryLongitude: formData.deliveryLng,
                weightKg: parseFloat(formData.weightKg),
                serviceId: parseInt(formData.serviceId)
            });

            toast.success('Order created successfully!');
            navigate(`/order/success/${order.orderNumber}`);
        } catch (error: any) {
            console.error('Failed to create order', error);
            toast.error(error.response?.data?.error || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                                    Create New Order
                                </CardTitle>
                                <CardDescription>
                                    Enter your delivery details below to schedule a pickup
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Addresses */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pickup">Pickup Address</Label>
                                            <LocationSearch
                                                id="pickup"
                                                placeholder="Search pickup location..."
                                                value={formData.pickupAddress}
                                                addressType="pickup"
                                                onLocationSelect={(address, lat, lng) =>
                                                    setFormData(prev => ({ ...prev, pickupAddress: address, pickupLat: lat, pickupLng: lng }))
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="delivery">Delivery Address</Label>
                                            <LocationSearch
                                                id="delivery"
                                                placeholder="Search delivery destination..."
                                                value={formData.deliveryAddress}
                                                addressType="delivery"
                                                onLocationSelect={(address, lat, lng) =>
                                                    setFormData(prev => ({ ...prev, deliveryAddress: address, deliveryLat: lat, deliveryLng: lng }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="weight">Weight (kg)</Label>
                                            <div className="relative">
                                                <Weight className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    placeholder="0.0"
                                                    className="pl-10"
                                                    value={formData.weightKg}
                                                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Service Type</Label>
                                            <Select
                                                value={formData.serviceId}
                                                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a service" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {services.map((service) => (
                                                        <SelectItem key={service.id} value={service.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{service.title}</span>
                                                                <span className="text-muted-foreground text-xs">({service.priceText})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Price Estimation */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                            <div className="flex items-center gap-2">
                                                <Calculator className="h-5 w-5 text-primary" />
                                                <span className="font-medium">Estimated Price</span>
                                                {calculating && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {estimatedPrice !== null && !calculating && (
                                                    <span className="text-xl font-bold text-foreground">
                                                        {estimatedPrice.toFixed(2)} ETB
                                                    </span>
                                                )}
                                                {calculating && (
                                                    <span className="text-sm text-muted-foreground">Calculating...</span>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleCalculate}
                                                    disabled={calculating}
                                                >
                                                    {calculating ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Calculating...
                                                        </>
                                                    ) : (
                                                        'Recalculate'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Price Breakdown */}
                                        {priceBreakdown && !calculating && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Info className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-medium text-foreground">Price Breakdown</span>
                                                </div>
                                                <div className="space-y-1.5 text-sm">
                                                    {calculatedDistance !== null && (
                                                        <div className="flex justify-between text-muted-foreground">
                                                            <span>Distance:</span>
                                                            <span className="font-medium text-foreground">{calculatedDistance.toFixed(2)} km</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Base Fee:</span>
                                                        <span className="font-medium text-foreground">{priceBreakdown.baseFee.toFixed(2)} ETB</span>
                                                    </div>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Distance Cost:</span>
                                                        <span className="font-medium text-foreground">{priceBreakdown.distanceCost.toFixed(2)} ETB</span>
                                                    </div>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Weight Fee:</span>
                                                        <span className="font-medium text-foreground">{priceBreakdown.weightFee.toFixed(2)} ETB</span>
                                                    </div>
                                                    {priceBreakdown.serviceFee > 0 && (
                                                        <div className="flex justify-between text-muted-foreground">
                                                            <span>{priceBreakdown.serviceName || 'Service'} Fee:</span>
                                                            <span className="font-medium text-foreground">{priceBreakdown.serviceFee.toFixed(2)} ETB</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-2 mt-2 border-t border-border/50 flex justify-between items-center">
                                                        <span className="font-semibold text-foreground">Total:</span>
                                                        <span className="text-lg font-bold text-primary">{priceBreakdown.total.toFixed(2)} ETB</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Helper text when fields are incomplete */}
                                        {!calculating && estimatedPrice === null && 
                                         (formData.weightKg || formData.pickupLat || formData.deliveryLat || formData.serviceId) && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                                                <Info className="h-3 w-3" />
                                                <span>Complete all fields to see estimated price</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary to-orange-600 hover:opacity-90 text-white"
                                        size="lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Creating Order...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Package className="h-5 w-5" />
                                                Create Order
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
