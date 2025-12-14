import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SpendingTrend } from '../../services/analyticsService';

interface SpendingChartProps {
    data: SpendingTrend[];
    period: 'week' | 'month' | 'year';
}

export function SpendingChart({ data, period }: SpendingChartProps) {
    const maxAmount = useMemo(() => {
        if (data.length === 0) return 1;
        const max = Math.max(...data.map(d => d.amount));
        // Ensure maxAmount is at least 1 to avoid division by zero
        return max > 0 ? max : 1;
    }, [data]);

    const trend = useMemo(() => {
        if (data.length < 2) return { direction: 'neutral', percentage: 0 };
        const first = data[0].amount;
        const last = data[data.length - 1].amount;
        const percentage = first > 0 ? ((last - first) / first) * 100 : 0;
        return {
            direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
            percentage: Math.abs(percentage)
        };
    }, [data]);

    const formatPeriod = (periodStr: string) => {
        if (period === 'week') {
            // Format: "2024-01-15" -> "Jan 15"
            const date = new Date(periodStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            // Format: "2024-01" -> "Jan 2024"
            const [year, month] = periodStr.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
    };

    if (data.length === 0) {
        return (
            <Card className="border-border/50 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Spending Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <p>No spending data available for this period</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 shadow-md">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Spending Trend
                    </CardTitle>
                    {trend.direction !== 'neutral' && (
                        <div className={`flex items-center gap-1 text-sm ${
                            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {trend.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{trend.percentage.toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Chart Bars */}
                    <div className="flex items-end justify-between gap-2" style={{ height: '240px', paddingBottom: '40px' }}>
                        {data.map((item, index) => {
                            // Calculate height as percentage of max, with minimum 8px for visibility
                            const heightPercent = maxAmount > 0 
                                ? (item.amount / maxAmount) * 100 
                                : 0;
                            // Use 200px as the max bar height (240px container - 40px padding)
                            const barHeight = Math.max((heightPercent / 100) * 200, 8);
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full">
                                    <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                                        <div
                                            className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer group relative"
                                            style={{ 
                                                height: `${barHeight}px`,
                                                minHeight: '8px',
                                                background: 'linear-gradient(to top, rgb(249, 115, 22), rgb(251, 146, 60))'
                                            }}
                                            title={`${formatPeriod(item.period)}: ${item.amount.toFixed(2)} ETB`}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg z-10">
                                                {item.amount.toFixed(2)} ETB
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-center w-full truncate mt-2">
                                        {formatPeriod(item.period)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

