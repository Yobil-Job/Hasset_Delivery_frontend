import { useMemo } from 'react';
import { Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FavoriteService } from '../../services/analyticsService';

interface ServiceDistributionProps {
    favoriteService: FavoriteService | null;
    totalOrders: number;
}

export function ServiceDistribution({ favoriteService, totalOrders }: ServiceDistributionProps) {
    const percentage = useMemo(() => {
        if (!favoriteService || totalOrders === 0) return 0;
        return (favoriteService.orderCount / totalOrders) * 100;
    }, [favoriteService, totalOrders]);

    if (!favoriteService) {
        return (
            <Card className="border-border/50 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="h-5 w-5 text-primary" />
                        Favorite Service
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p>No service data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    Favorite Service
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-foreground">{favoriteService.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {favoriteService.orderCount} of {totalOrders} orders
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-primary">
                                <TrendingUp className="h-5 w-5" />
                                <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">of total orders</p>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

