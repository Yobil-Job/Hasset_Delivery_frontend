import { useEffect, useState } from 'react';
import { Package, Users, Truck, DollarSign } from 'lucide-react';
import { GlassCard } from '../global/GlassCard';
import { Button } from '../ui/button';
import { adminService } from '../../services/adminService';
import { formatDistanceToNow } from 'date-fns';

interface DashboardSectionProps {
  onNavigate?: (section: string) => void;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  price: number;
  createdAt: string;
  driver?: {
    user?: {
      firstname?: string;
      lastname?: string;
    };
  };
  customerId?: number;
}

export function DashboardSection({ onNavigate }: DashboardSectionProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allOrders, drivers, active] = await Promise.all([
        adminService.getAllOrders().catch(() => []),
        adminService.getAllDrivers().catch(() => []),
        adminService.getActiveDrivers().catch(() => [])
      ]);
      setOrders(allOrders || []);
      setAllDrivers(drivers || []);
      setActiveDrivers(active || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const activeDeliveries = orders.filter(o => 
    ['CREATED', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(o.status)
  ).length;
  
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(now.setDate(now.getDate() - 7));
  const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));

  let revenueToday = 0;
  let revenueWeek = 0;
  let revenueMonth = 0;

  orders.forEach(order => {
    const createdAt = new Date(order.createdAt);
    const price = order.price || 0;
    
    if (createdAt >= startOfToday) revenueToday += price;
    if (createdAt >= startOfWeek) revenueWeek += price;
    if (createdAt >= startOfMonth) revenueMonth += price;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const activeDriversCount = activeDrivers.length;
  const totalDrivers = allDrivers.filter(d => d.status === 'APPROVED').length;

  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(order => ({
      id: order.orderNumber,
      customer: `Customer #${order.customerId || 'N/A'}`,
      driver: order.driver 
        ? `${order.driver.user?.firstname || ''} ${order.driver.user?.lastname || ''}`.trim() || 'Unassigned'
        : 'Unassigned',
      status: order.status.replace(/_/g, ' '),
      amount: `${order.price?.toLocaleString() || 0} ETB`,
      time: formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
    }));

  const getStatusColor = (status: string) => {
    const normalized = status.toUpperCase().replace(/\s/g, '_');
    switch (normalized) {
      case 'DELIVERED':
        return 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500';
      case 'ON_THE_WAY':
      case 'ON THE WAY':
        return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500';
      case 'PENDING':
      case 'CREATED':
        return 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:text-white dark:border-amber-500';
      default:
        return 'bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:text-white dark:border-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+12.5%',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      trend: 'up',
    },
    {
      title: 'Active Deliveries',
      value: activeDeliveries.toLocaleString(),
      change: '+8.2%',
      icon: Truck,
      gradient: 'from-green-500 to-emerald-500',
      trend: 'up',
    },
    {
      title: 'Total Revenue',
      value: `${totalRevenue.toLocaleString()} ETB`,
      change: '+23.1%',
      icon: DollarSign,
      gradient: 'from-primary to-orange-600',
      trend: 'up',
    },
    {
      title: 'Active Drivers',
      value: `${activeDriversCount} / ${totalDrivers}`,
      change: '+4.3%',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      trend: 'up',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, Admin
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your deliveries today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.gradient} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Orders
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate?.('orders')}
          >
            View All
          </Button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Driver
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border"
                  >
                    <td className="py-3 px-4 text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {order.customer}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {order.driver}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {order.amount}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {order.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

