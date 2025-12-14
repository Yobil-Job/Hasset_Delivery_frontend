import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Package, DollarSign, Users, Truck, Calendar } from 'lucide-react';
import { Card3D } from '../global/Card3D';
import { GlassCard } from '../global/GlassCard';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { adminService } from '../../services/adminService';

export function AnalyticsSection() {
  const [timeRange, setTimeRange] = useState('30days');
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allOrders, allDrivers] = await Promise.all([
        adminService.getAllOrders().catch(() => []),
        adminService.getAllDrivers().catch(() => [])
      ]);
      setOrders(allOrders || []);
      setDrivers(allDrivers || []);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalOrders = orders.length;
  const activeCustomers = new Set(orders.map(o => o.customerId).filter(Boolean)).size;
  const activeDriversCount = drivers.filter(d => d.status === 'APPROVED').length;

  // Calculate revenue and orders trend (last 7 days)
  const now = new Date();
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });
    
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce((sum, o) => sum + (o.price || 0), 0),
      orders: dayOrders.length,
    };
  });

  // Order status distribution
  const statusCounts = orders.reduce((acc, o) => {
    const status = o.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusData = [
    { name: 'Delivered', value: statusCounts['DELIVERED'] || 0, color: '#10b981' },
    { name: 'On The Way', value: statusCounts['ON_THE_WAY'] || 0, color: '#3b82f6' },
    { name: 'Pending', value: statusCounts['CREATED'] || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: statusCounts['CANCELLED'] || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Top drivers by order count
  const driverOrderCounts = orders.reduce((acc, o) => {
    if (o.driver?.id) {
      acc[o.driver.id] = (acc[o.driver.id] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const topDriversData = Object.entries(driverOrderCounts)
    .map(([driverId, count]) => {
      const driver = drivers.find(d => d.id === parseInt(driverId));
      const name = driver 
        ? `${driver.user?.firstname || ''} ${driver.user?.lastname || ''}`.trim() || 'Unknown'
        : 'Unknown';
      return { name: name.length > 10 ? name.substring(0, 10) + '.' : name, deliveries: count };
    })
    .sort((a, b) => b.deliveries - a.deliveries)
    .slice(0, 5);

  // Monthly trends (last 6 months)
  const monthlyTrendsData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (5 - i));
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, o) => sum + (o.price || 0), 0),
    };
  });

  const stats = [
    {
      title: 'Total Revenue',
      value: `${totalRevenue.toLocaleString()} ETB`,
      change: '+23.1%',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+12.5%',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      trend: 'up',
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toString(),
      change: '+8.2%',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      trend: 'up',
    },
    {
      title: 'Active Drivers',
      value: activeDriversCount.toString(),
      change: '+4.3%',
      icon: Truck,
      gradient: 'from-orange-500 to-red-500',
      trend: 'up',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Track your business performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card3D>
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
            </Card3D>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders Trend */}
        <Card3D>
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue & Orders Trend
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF6600"
                    strokeWidth={3}
                    name="Revenue (ETB)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </Card3D>

        {/* Order Status Distribution */}
        <Card3D>
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Status Distribution
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </Card3D>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Drivers */}
        <Card3D>
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Top Performing Drivers
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topDriversData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="deliveries" fill="#FF6600" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </Card3D>

        {/* Monthly Trends */}
        <Card3D>
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Performance
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Orders" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue (ETB)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </Card3D>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card3D>
          <GlassCard className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold">Peak Hours</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-1">12 PM - 2 PM</p>
            <p className="text-sm text-muted-foreground">Highest order volume</p>
          </GlassCard>
        </Card3D>

        <Card3D>
          <GlassCard className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold">Avg Order Value</h4>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {totalOrders > 0 ? `${Math.round(totalRevenue / totalOrders).toLocaleString()} ETB` : '0 ETB'}
            </p>
            <p className="text-sm text-muted-foreground">+15% from last month</p>
          </GlassCard>
        </Card3D>

        <Card3D>
          <GlassCard className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold">Completion Rate</h4>
            </div>
            <p className="text-2xl font-bold text-purple-600 mb-1">
              {totalOrders > 0 ? `${Math.round((statusCounts['DELIVERED'] || 0) / totalOrders * 100)}%` : '0%'}
            </p>
            <p className="text-sm text-muted-foreground">Above target (90%)</p>
          </GlassCard>
        </Card3D>
      </div>
    </div>
  );
}

