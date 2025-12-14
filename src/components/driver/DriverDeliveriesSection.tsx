import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Package,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface DriverDeliveriesSectionProps {
  orders: any[];
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'ASSIGNED':
    case 'PENDING':
      return 'Pending';
    case 'PICKED_UP':
    case 'ON_THE_WAY':
      return 'En Route';
    case 'DELIVERED':
      return 'Delivered';
    case 'PENDING_APPROVAL':
      return 'Pending Approval';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status || 'Unknown';
  }
};

const getStatusColor = (label: string) => {
  switch (label) {
    case 'En Route':
      return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500';
    case 'Pending':
      return 'bg-purple-500 text-white border-purple-600 dark:bg-purple-600 dark:text-white dark:border-purple-500';
    case 'Delivered':
      return 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500';
    case 'Pending Approval':
      return 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:text-white dark:border-orange-500';
    case 'Cancelled':
      return 'bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white dark:border-red-400';
    default:
      return 'bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:text-white dark:border-slate-500';
  }
};

export function DriverDeliveriesSection({ orders }: DriverDeliveriesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const deliveries = useMemo(
    () =>
      (orders || []).map((order: any) => ({
        id: order.orderNumber || order.id,
        orderId: order.id,
        customer:
          order.customer?.firstname && order.customer?.lastname
            ? `${order.customer.firstname} ${order.customer.lastname}`
            : order.customerName || 'Customer',
        phone: order.customerPhone || 'N/A',
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        statusLabel: getStatusLabel(order.status),
        distance: order.distance || '—',
        payment: order.price != null ? `${order.price} ETB` : '—',
        time: order.createdAt
          ? new Date(order.createdAt).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : '',
      })),
    [orders],
  );

  const filteredDeliveries = deliveries.filter((delivery) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      delivery.id?.toString().toLowerCase().includes(q) ||
      delivery.customer.toLowerCase().includes(q) ||
      (delivery.deliveryAddress || '').toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        matchesStatus = ['Pending'].includes(delivery.statusLabel);
      } else if (statusFilter === 'en-route') {
        matchesStatus = ['En Route'].includes(delivery.statusLabel);
      } else if (statusFilter === 'delivered') {
        matchesStatus = ['Delivered'].includes(delivery.statusLabel);
      } else if (statusFilter === 'pending-approval') {
        matchesStatus = ['Pending Approval'].includes(delivery.statusLabel);
      } else if (statusFilter === 'cancelled') {
        matchesStatus = ['Cancelled'].includes(delivery.statusLabel);
      }
    }

    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => {
    const total = deliveries.length;
    const active = deliveries.filter(
      (d) => !['Delivered', 'Cancelled'].includes(d.statusLabel),
    ).length;
    const completed = deliveries.filter((d) => d.statusLabel === 'Delivered').length;
    const today = deliveries.filter((d) => {
      if (!d.date) return false;
      const todayStr = new Date().toLocaleDateString();
      return d.date === todayStr;
    }).length;
    return { total, active, completed, today };
  }, [deliveries]);

  const handleNavigate = (delivery: any) => {
    if (!delivery.deliveryAddress) return;
    const encodedAddress = encodeURIComponent(delivery.deliveryAddress);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, '_blank');
    toast.success(`Opening navigation to ${delivery.deliveryAddress}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-foreground">My Deliveries</h1>
        <p className="text-muted-foreground">Search and review your recent deliveries</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by order ID, customer, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="en-route">En Route</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending-approval">Pending Approval</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active', value: stats.active, color: 'from-yellow-500 to-orange-500' },
          { label: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500' },
          { label: 'Today', value: stats.today, color: 'from-purple-500 to-pink-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden border-0 bg-transparent shadow-none">
              <div
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
              >
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-2xl mt-1 font-semibold">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <motion.div
            key={delivery.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border border-border bg-card">
              <CardContent className="p-4 flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center text-white">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-foreground">#{delivery.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.date} • {delivery.time}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(delivery.statusLabel)} border`}>
                      {delivery.statusLabel}
                    </Badge>
                  </div>

                  <div className="border-l-2 border-primary/70 pl-4 space-y-2">
                    <div>
                      <p className="text-sm text-foreground font-medium">Customer</p>
                      <p className="text-sm text-muted-foreground">{delivery.customer}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {delivery.phone}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[#FF6600] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{delivery.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted/60 rounded-lg">
                      <p className="text-muted-foreground mb-1">Distance</p>
                      <p className="font-medium text-foreground">{delivery.distance}</p>
                    </div>
                    <div className="p-2 bg-muted/60 rounded-lg">
                      <p className="text-muted-foreground mb-1">Payment</p>
                      <p className="font-medium text-primary">{delivery.payment}</p>
                    </div>
                    <div className="p-2 bg-muted/60 rounded-lg">
                      <p className="text-muted-foreground mb-1">Time</p>
                      <p className="font-medium text-foreground">{delivery.time}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleNavigate(delivery)}
                      variant="outline"
                      className="w-full"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    {/* Actions like Accept / Complete are handled by the Active Order card to avoid conflicts */}
                    {delivery.statusLabel === 'Delivered' && (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <Card className="border-dashed border-2 border-border bg-card/40">
          <CardContent className="py-10 text-center text-muted-foreground space-y-2">
            <Package className="h-10 w-10 mx-auto opacity-40 mb-2" />
            <p>No deliveries found</p>
            <p className="text-xs">
              Adjust your filters or try searching by a different order ID or address.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


