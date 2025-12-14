import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Truck, Search, Download, Eye, Phone, Mail, MapPin, Star, Package, CheckCircle, Clock, Plus, X, Lock, Copy, UserCheck, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card3D } from '../global/Card3D';
import { GlassCard } from '../global/GlassCard';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { adminService, ActiveDriver } from '../../services/adminService';
import { Driver } from '../../services/driverService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export function DriversSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<Driver[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allDrvs, pending, active] = await Promise.all([
        adminService.getAllDrivers().catch(() => []),
        adminService.getPendingDrivers().catch(() => []),
        adminService.getActiveDrivers().catch(() => [])
      ]);
      setDrivers(allDrvs || []);
      setPendingDrivers(pending || []);
      setActiveDrivers(active || []);
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Drivers',
      value: drivers.filter(d => d.status === 'APPROVED').length.toString(),
      change: '+4.3%',
      icon: Truck,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Online Now',
      value: activeDrivers.length.toString(),
      change: `${Math.round((activeDrivers.length / drivers.filter(d => d.status === 'APPROVED').length) * 100) || 0}% active`,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Pending Approval',
      value: pendingDrivers.length.toString(),
      change: 'Awaiting review',
      icon: Clock,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Suspended',
      value: drivers.filter(d => d.status === 'SUSPENDED').length.toString(),
      change: 'Inactive',
      icon: Lock,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const filteredDrivers = drivers.filter(driver =>
    (driver.user?.firstname && driver.user.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (driver.user?.lastname && driver.user.lastname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (driver.user?.email && driver.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (driver.id && driver.id.toString().includes(searchQuery))
  );

  const getInitials = (driver: Driver) => {
    const first = driver.user?.firstname?.[0] || '';
    const last = driver.user?.lastname?.[0] || '';
    return (first + last).toUpperCase() || 'D';
  };

  const getStatusBadge = (status: string, driverId?: number) => {
    const isActive = activeDrivers.some(ad => ad.driverId === driverId);
    const configs: Record<string, { className: string; label: string }> = {
      'APPROVED': { 
        className: isActive
          ? 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500'
          : 'bg-slate-600 text-white border-slate-700 dark:bg-slate-500 dark:text-white dark:border-slate-400',
        label: isActive ? 'Online' : 'Offline'
      },
      'PENDING': {
        className: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:text-white dark:border-amber-500',
        label: 'Pending',
      },
      'SUSPENDED': {
        className: 'bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white dark:border-red-400',
        label: 'Suspended',
      },
      'REJECTED': {
        className: 'bg-slate-600 text-white border-slate-700 dark:bg-slate-500 dark:text-white dark:border-slate-400',
        label: 'Rejected',
      },
    };
    const config = configs[status] || configs['PENDING'];
    return <Badge variant="default" className={config.className}>{config.label}</Badge>;
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleApproveDriver = async (id: number) => {
    try {
      await adminService.approveDriver(id);
      toast.success('Driver approved successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to approve driver');
    }
  };

  const handleRejectDriver = async (id: number) => {
    try {
      await adminService.rejectDriver(id);
      toast.success('Driver rejected');
      loadData();
    } catch (error) {
      toast.error('Failed to reject driver');
    }
  };

  const handleSuspendDriver = async (id: number) => {
    try {
      await adminService.suspendDriver(id);
      toast.success('Driver suspended');
      loadData();
    } catch (error) {
      toast.error('Failed to suspend driver');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Status', 'Vehicle Type'].join(','),
      ...filteredDrivers.map(d => 
        [
          d.id,
          `${d.user?.firstname || ''} ${d.user?.lastname || ''}`.trim(),
          d.user?.email || '',
          d.user?.phoneNumber || '',
          d.status,
          d.vehicleType || ''
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drivers.csv';
    a.click();
    toast.success('Drivers exported successfully');
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Drivers Management</h1>
          <p className="text-muted-foreground">Manage and monitor all drivers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs for Active Drivers and Pending Applications */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">
            <Truck className="h-4 w-4 mr-2" />
            Active Drivers
          </TabsTrigger>
          <TabsTrigger value="pending">
            <UserCheck className="h-4 w-4 mr-2" />
            Pending Applications
          </TabsTrigger>
        </TabsList>

        {/* Active Drivers Tab */}
        <TabsContent value="active" className="space-y-6 mt-6">
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
                  placeholder="Search drivers by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </GlassCard>
          </Card3D>

          {/* Drivers List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDrivers.filter(d => d.status === 'APPROVED').map((driver, index) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card3D>
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg">
                            {getInitials(driver)}
                          </AvatarFallback>
                        </Avatar>
                        {activeDrivers.some(ad => ad.driverId === driver.id) && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold truncate">
                              {driver.user?.firstname} {driver.user?.lastname}
                            </h3>
                            <p className="text-xs text-muted-foreground">ID: {driver.id}</p>
                          </div>
                          {getStatusBadge(driver.status, driver.id)}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{driver.user?.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{driver.user?.phoneNumber || 'N/A'}</span>
                          </div>
                          {driver.vehicleType && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Truck className="h-3.5 w-3.5" />
                              <span className="truncate">{driver.vehicleType}</span>
                            </div>
                          )}
                          {driver.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate">{driver.address}</span>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleViewDriver(driver)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </Card3D>
              </motion.div>
            ))}
          </div>

          {filteredDrivers.filter(d => d.status === 'APPROVED').length === 0 && (
            <Card3D>
              <GlassCard className="p-12 text-center">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No drivers found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </GlassCard>
            </Card3D>
          )}
        </TabsContent>

        {/* Pending Applications Tab */}
        <TabsContent value="pending" className="space-y-6 mt-6">
          <PendingDriversSection 
            pendingDrivers={pendingDrivers}
            onApprove={handleApproveDriver}
            onReject={handleRejectDriver}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>

      {/* View Driver Details Modal */}
      {selectedDriver && (
        <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Driver Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl">
                    {getInitials(selectedDriver)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-xl">
                    {selectedDriver.user?.firstname} {selectedDriver.user?.lastname}
                  </h4>
                  <p className="text-sm text-muted-foreground">ID: {selectedDriver.id}</p>
                  {getStatusBadge(selectedDriver.status, selectedDriver.id)}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h5 className="font-semibold mb-2">Contact Information</h5>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedDriver.user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{selectedDriver.user?.phoneNumber || 'N/A'}</span>
                </div>
                {selectedDriver.vehicleType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="font-medium">{selectedDriver.vehicleType}</span>
                  </div>
                )}
                {selectedDriver.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">{selectedDriver.address}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {selectedDriver.status === 'APPROVED' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to suspend this driver?')) {
                        handleSuspendDriver(selectedDriver.id);
                        setSelectedDriver(null);
                      }
                    }}
                  >
                    Suspend Driver
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Pending Drivers Section Component
interface PendingDriversSectionProps {
  pendingDrivers: Driver[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onRefresh: () => void;
}

function PendingDriversSection({ pendingDrivers, onApprove, onReject, onRefresh }: PendingDriversSectionProps) {
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    await onApprove(id);
    setActionLoading(null);
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    await onReject(id);
    setActionLoading(null);
  };

  if (pendingDrivers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl mb-2">No Pending Applications</h3>
        <p className="text-muted-foreground">All driver applications have been processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-foreground mb-1">Pending Driver Applications</h2>
          <p className="text-muted-foreground">Review and approve new driver registrations</p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {pendingDrivers.map((driver) => (
          <Card3D key={driver.id}>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    {driver.user?.firstname?.[0] || ''}{driver.user?.lastname?.[0] || ''}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg">
                        {driver.user?.firstname} {driver.user?.lastname}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{driver.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{driver.user?.phoneNumber || 'N/A'}</span>
                    </div>
                    {driver.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{driver.address}</span>
                      </div>
                    )}
                  </div>

                  {driver.vehicleType && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Vehicle Type</p>
                          <p className="capitalize text-foreground">{driver.vehicleType}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleApprove(driver.id)}
                      disabled={actionLoading === driver.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === driver.id ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(driver.id)}
                      disabled={actionLoading === driver.id}
                    >
                      {actionLoading === driver.id ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card3D>
        ))}
      </div>
    </div>
  );
}

