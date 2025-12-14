import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Download, Eye, Mail, Phone, MapPin, Package, TrendingUp, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card3D } from '../global/Card3D';
import { GlassCard } from '../global/GlassCard';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { adminService, AdminCustomer } from '../../services/adminService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface Customer extends AdminCustomer {
  id: number;
}

export function CustomersSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allCustomers = await adminService.getAllCustomers();
      setCustomers(allCustomers || []);
    } catch (error: any) {
      console.error('Failed to load customers:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      change: '+12.5%',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Customers',
      value: customers.filter(c => {
        if (!c.lastOrderDate) return false;
        const daysSinceLastOrder = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastOrder <= 30;
      }).length.toString(),
      change: '+8.2%',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'New This Month',
      value: customers.filter(c => {
        if (!c.createdAt) return false;
        const daysSinceCreated = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreated <= 30;
      }).length.toString(),
      change: '+23.1%',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Avg Orders/Customer',
      value: customers.length > 0
        ? (customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0) / customers.length).toFixed(1)
        : '0',
      change: '+5.3%',
      icon: Package,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.toString().includes(searchQuery) ||
    (customer.firstname && customer.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.lastname && customer.lastname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (customer: Customer) => {
    if (customer.firstname && customer.lastname) {
      return (customer.firstname[0] + customer.lastname[0]).toUpperCase();
    }
    const fallback = customer.email || `C${customer.id}`;
    return fallback[0]?.toUpperCase() || 'C';
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.firstname && customer.lastname) {
      return `${customer.firstname} ${customer.lastname}`;
    }
    if (customer.email) {
      return customer.email.split('@')[0];
    }
    return `Customer ${customer.id}`;
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Email', 'Total Orders', 'Total Spent', 'Last Order'].join(','),
      ...filteredCustomers.map(c => 
        [
          c.id,
          c.email,
          c.totalOrders || 0,
          c.totalSpent || 0,
          c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    toast.success('Customers exported successfully');
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Customers Management</h1>
          <p className="text-muted-foreground">Manage and view all customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
                  <span className="text-sm font-medium text-green-600">
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

      {/* Search */}
      <Card3D>
        <GlassCard className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customers by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </GlassCard>
      </Card3D>

      {/* Customers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCustomers.map((customer, index) => {
          const isActive = customer.lastOrderDate 
            ? (Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24) <= 30
            : false;

          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card3D>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-orange-600 text-white text-lg">
                        {getInitials(customer)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold truncate">{getCustomerName(customer)}</h3>
                          <p className="text-xs text-muted-foreground">ID: {customer.id}</p>
                        </div>
                        <Badge
                          variant="default"
                          className={isActive
                            ? 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500'
                            : 'bg-slate-600 text-white border-slate-700 dark:bg-slate-500 dark:text-white dark:border-slate-400'
                          }
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        {customer.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{customer.phoneNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                          <p className="font-semibold">{customer.totalOrders || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                          <p className="font-semibold text-primary">
                            {customer.totalSpent?.toLocaleString() || 0} ETB
                          </p>
                        </div>
                        {customer.lastOrderDate && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Last Order</p>
                            <p className="text-sm">
                              {new Date(customer.lastOrderDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </Card3D>
            </motion.div>
          );
        })}
      </div>

      {!loading && filteredCustomers.length === 0 && customers.length === 0 && (
        <Card3D>
          <GlassCard className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No customers found</h3>
            <p className="text-sm text-muted-foreground">
              There are no customers in the system yet.
            </p>
          </GlassCard>
        </Card3D>
      )}

      {!loading && filteredCustomers.length === 0 && customers.length > 0 && (
        <Card3D>
          <GlassCard className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No customers match your search</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </GlassCard>
        </Card3D>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-orange-600 text-white text-2xl">
                    {getInitials(selectedCustomer)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-xl">{getCustomerName(selectedCustomer)}</h4>
                  <p className="text-sm text-muted-foreground">ID: {selectedCustomer.id}</p>
                  <Badge
                    variant="default"
                    className={
                      selectedCustomer.lastOrderDate &&
                      (Date.now() - new Date(selectedCustomer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24) <= 30
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/60 mt-2'
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-600 mt-2'
                    }
                  >
                    {selectedCustomer.lastOrderDate &&
                    (Date.now() - new Date(selectedCustomer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24) <= 30
                      ? 'Active'
                      : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h5 className="font-semibold mb-2">Contact Information</h5>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{selectedCustomer.phoneNumber}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-primary">{selectedCustomer.totalOrders || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedCustomer.totalSpent?.toLocaleString() || 0} ETB
                  </p>
                </div>
                {selectedCustomer.lastOrderDate && (
                  <div className="bg-muted/50 rounded-lg p-4 col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Last Order</p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedCustomer.lastOrderDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

