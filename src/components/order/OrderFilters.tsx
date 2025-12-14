import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Package, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OrderFilters as OrderFiltersType } from '../../services/orderService';
import { ServiceOffering } from '../../services/pricing';

interface OrderFiltersProps {
    filters: OrderFiltersType;
    onFiltersChange: (filters: OrderFiltersType) => void;
    services: ServiceOffering[];
    priceRange: { min: number; max: number };
}

export function OrderFilters({ filters, onFiltersChange, services, priceRange }: OrderFiltersProps) {
    const [localFilters, setLocalFilters] = useState<OrderFiltersType>(filters);
    const [priceSliderValue, setPriceSliderValue] = useState<number[]>([
        filters.minPrice ?? priceRange.min,
        filters.maxPrice ?? priceRange.max
    ]);

    useEffect(() => {
        setLocalFilters(filters);
        setPriceSliderValue([
            filters.minPrice ?? priceRange.min,
            filters.maxPrice ?? priceRange.max
        ]);
    }, [filters, priceRange]);

    const handleFilterChange = (key: keyof OrderFiltersType, value: any) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        onFiltersChange(updated);
    };

    const handlePriceRangeChange = (values: number[]) => {
        setPriceSliderValue(values);
    };

    const handlePriceRangeCommit = (values: number[]) => {
        handleFilterChange('minPrice', values[0]);
        handleFilterChange('maxPrice', values[1]);
    };

    const clearFilters = () => {
        const cleared: OrderFiltersType = {};
        setLocalFilters(cleared);
        setPriceSliderValue([priceRange.min, priceRange.max]);
        onFiltersChange(cleared);
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <Card className="border-border/50 shadow-md">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Filter Orders
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 text-xs"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Status Filter */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={localFilters.status || ''}
                        onValueChange={(value) => handleFilterChange('status', value || undefined)}
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All statuses</SelectItem>
                            <SelectItem value="CREATED">Created</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="ASSIGNED">Assigned</SelectItem>
                            <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                            <SelectItem value="ON_THE_WAY">On The Way</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Range
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                                Start Date
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={localFilters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                                End Date
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={localFilters.endDate || ''}
                                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                                className="h-9"
                            />
                        </div>
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price Range (ETB)
                    </Label>
                    <div className="space-y-3">
                        <Slider
                            value={priceSliderValue}
                            onValueChange={handlePriceRangeChange}
                            onValueCommit={handlePriceRangeCommit}
                            min={priceRange.min}
                            max={priceRange.max}
                            step={10}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{priceSliderValue[0].toFixed(2)} ETB</span>
                            <span>{priceSliderValue[1].toFixed(2)} ETB</span>
                        </div>
                    </div>
                </div>

                {/* Service Type Filter */}
                {services.length > 0 && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Service Type
                        </Label>
                        <Select
                            value={localFilters.serviceId?.toString() || ''}
                            onValueChange={(value) => handleFilterChange('serviceId', value ? parseInt(value) : undefined)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All services" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All services</SelectItem>
                                {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                        {service.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

