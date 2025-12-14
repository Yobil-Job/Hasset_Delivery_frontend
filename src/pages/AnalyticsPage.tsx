import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Package, MapPin, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SEO } from '../components/global/SEO';
import { GlassCard } from '../components/global/GlassCard';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { analyticsService, AnalyticsResponse } from '../services/analyticsService';
import { SpendingChart } from '../components/analytics/SpendingChart';
import { ServiceDistribution } from '../components/analytics/ServiceDistribution';

type Period = 'week' | 'month' | 'year';

export function AnalyticsPage() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('month');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getAnalytics(period);
            setAnalytics(data);
        } catch (error: any) {
            console.error('Failed to fetch analytics', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-background/50">
                <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-background/50">
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">No analytics data available</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-background/50">
            <SEO
                title="Order Analytics - ሀሴት Delivery"
                description="View your order statistics, spending trends, and delivery insights."
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground">Order Analytics</h1>
                        <p className="text-muted-foreground mt-2">Insights into your delivery patterns and spending</p>
                    </div>
                    <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Spent</p>
                                <p className="text-2xl font-bold">{analytics.totalSpent.toFixed(2)} ETB</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                                <p className="text-2xl font-bold">{analytics.averageOrderValue.toFixed(2)} ETB</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Order Frequency</p>
                                <p className="text-2xl font-bold capitalize">{analytics.orderFrequency}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <SpendingChart data={analytics.spendingTrend} period={period} />
                    <ServiceDistribution 
                        favoriteService={analytics.favoriteService} 
                        totalOrders={analytics.totalOrders} 
                    />
                </div>

                {/* Top Locations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Pickup Locations */}
                    <Card className="border-border/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-primary" />
                                Top Pickup Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics.topPickupLocations.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No pickup location data</p>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.topPickupLocations.map((location, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <p className="text-sm font-medium truncate">{location.address}</p>
                                            </div>
                                            <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                                {location.count} {location.count === 1 ? 'order' : 'orders'}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Delivery Locations */}
                    <Card className="border-border/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-primary" />
                                Top Delivery Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics.topDeliveryLocations.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No delivery location data</p>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.topDeliveryLocations.map((location, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <p className="text-sm font-medium truncate">{location.address}</p>
                                            </div>
                                            <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                                {location.count} {location.count === 1 ? 'order' : 'orders'}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

