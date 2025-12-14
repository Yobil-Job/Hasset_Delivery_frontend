import { useState, useEffect, useRef } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  MapPin,
  Clock,
  User,
  Phone,
  X,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GlassCard } from '../global/GlassCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { adminService, ActiveDriver } from '../../services/adminService';
import { Driver } from '../../services/driverService';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  price: number;
  weightKg: number;
  distanceKm: number;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryLatitude: number;
  deliveryLongitude: number;
  createdAt: string;
  driver?: Driver;
  customerId?: number;
  serviceOffering?: {
    id: number;
    title?: string;
    name?: string;
  };
}

interface DriverWithDistance extends Driver {
  distanceToPickup?: number;
  isActive?: boolean;
  currentOrder?: {
    orderNumber: string;
    pickupAddress: string;
    deliveryAddress: string;
  };
}

export function OrdersSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverWithDistance[]>([]);
  const [assigningDriverId, setAssigningDriverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverSearch, setDriverSearch] = useState('');
  const [shouldScrollToAssign, setShouldScrollToAssign] = useState(false);
  const assignSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedOrder && selectedOrder.status === 'PAID') {
      calculateDriverDistances();
    }
  }, [selectedOrder, activeDrivers, allDrivers]);

  // Reset scroll flag when dialog closes
  useEffect(() => {
    if (!isDetailsOpen) {
      setShouldScrollToAssign(false);
    }
  }, [isDetailsOpen]);

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
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateDriverDistances = () => {
    if (!selectedOrder?.pickupLatitude || !selectedOrder?.pickupLongitude) {
      const approved = allDrivers.filter(d => d.status === 'APPROVED');
      setAvailableDrivers(approved);
      return;
    }

    const driversWithDist = allDrivers
      .filter(d => d.status === 'APPROVED')
      .map(driver => {
        const active = activeDrivers.find(ad => ad.driverId === driver.id);
        const currentOrder = active
          ? orders.find(o => o.id === active.currentOrderId)
          : undefined;
        let distance = Infinity;

        if (active && active.location) {
          const [lat, lon] = active.location.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lon)) {
            distance = calculateDistance(
              selectedOrder.pickupLatitude!,
              selectedOrder.pickupLongitude!,
              lat,
              lon
            );
          }
        }

        return {
          ...driver,
          distanceToPickup: distance,
          isActive: !!active,
          currentOrder: currentOrder
            ? {
                orderNumber: currentOrder.orderNumber,
                pickupAddress: currentOrder.pickupAddress,
                deliveryAddress: currentOrder.deliveryAddress,
              }
            : undefined,
        };
      })
      .sort((a, b) => {
        const da = a.distanceToPickup ?? Infinity;
        const db = b.distanceToPickup ?? Infinity;
        const aHasDist = da !== Infinity;
        const bHasDist = db !== Infinity;

        // Drivers with known distance first
        if (aHasDist !== bHasDist) {
          return aHasDist ? -1 : 1;
        }

        // Among them, active drivers first
        if (!!a.isActive !== !!b.isActive) {
          return a.isActive ? -1 : 1;
        }

        // Finally, sort by distance
        return da - db;
      });

    setAvailableDrivers(driversWithDist);
  };

  const handleAssignDriver = async (driverId: number) => {
    if (!selectedOrder) return;
    setAssigningDriverId(driverId);
    try {
      await adminService.assignDriver(selectedOrder.id, driverId);
      toast.success('Driver assigned successfully');
      setIsDetailsOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Assign driver error:', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to assign driver';
      toast.error(message);
    } finally {
      setAssigningDriverId(null);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setShouldScrollToAssign(false);
  };

  const handleOpenAssignFromList = (order: Order) => {
    // Open the same details modal focused on the assign section
    setSelectedOrder(order);
    setShouldScrollToAssign(true);
    setIsDetailsOpen(true);
    
    // Always calculate driver distances when opening assignment
    // Use setTimeout to ensure modal is open before calculating
    setTimeout(() => {
      if (order.status === 'PAID') {
        calculateDriverDistances();
      }
    }, 100);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.driver?.user?.firstname && order.driver.user.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.driver?.user?.lastname && order.driver.user.lastname.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = order.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

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
      case 'PAID':
        return 'bg-green-600 text-white border-green-700 dark:bg-green-500 dark:text-white dark:border-green-400';
      case 'ASSIGNED':
      case 'PICKED_UP':
        return 'bg-purple-500 text-white border-purple-600 dark:bg-purple-600 dark:text-white dark:border-purple-500';
      case 'CANCELLED':
        return 'bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white dark:border-red-400';
      default:
        return 'bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:text-white dark:border-slate-500';
    }
  };

  const handleExport = () => {
    const csv = [
      ['Order Number', 'Status', 'Price', 'Pickup Address', 'Delivery Address', 'Created At'].join(','),
      ...filteredOrders.map(order => 
        [
          order.orderNumber,
          order.status,
          order.price,
          `"${order.pickupAddress}"`,
          `"${order.deliveryAddress}"`,
          order.createdAt
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    toast.success('Orders exported successfully');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Orders Management</h2>
          <p className="text-muted-foreground">View and manage all delivery orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search orders by ID, address, driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="CREATED">Created</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="PICKED_UP">Picked Up</SelectItem>
              <SelectItem value="ON_THE_WAY">On The Way</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Orders Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Order Number</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Pickup</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Delivery</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Driver</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Created</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border"
                >
                  <td className="py-3 px-4 text-sm font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{order.pickupAddress}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{order.deliveryAddress}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {order.driver 
                      ? `${order.driver.user?.firstname || ''} ${order.driver.user?.lastname || ''}`.trim() || 'N/A'
                      : 'Unassigned'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{order.price?.toLocaleString()} ETB</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'PAID' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAssignFromList(order)}
                          className="h-8 w-8 p-0"
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </GlassCard>

      {/* Order Details & Assign Driver Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        setIsDetailsOpen(open);
        if (!open) {
          setShouldScrollToAssign(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{shouldScrollToAssign ? 'Assign Driver' : 'Order Details'}</DialogTitle>
          </DialogHeader>

          {selectedOrder ? (
            <div className="mt-4 space-y-6">
              {/* Driver Assignment - Show first when opened from truck icon */}
              {shouldScrollToAssign && (
                <div ref={assignSectionRef} className="pb-6 border-b">
                  {selectedOrder.status === 'PAID' ? (
                    <>
                  <h3 className="text-lg font-semibold mb-4">Assign Driver</h3>

                  {/* Driver search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search drivers by name or phone..."
                        value={driverSearch}
                        onChange={(e) => setDriverSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[320px]">
                    {(() => {
                      // Show loading state if drivers are being calculated
                      if (availableDrivers.length === 0 && allDrivers.length > 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Truck className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
                            <p>Loading available drivers...</p>
                          </div>
                        );
                      }

                      const q = driverSearch.toLowerCase();
                      const filtered = availableDrivers.filter((driver) => {
                        const name = `${driver.user?.firstname || ''} ${driver.user?.lastname || ''}`.toLowerCase();
                        const phone = (driver.user?.phoneNumber || '').toLowerCase();
                        return !q || name.includes(q) || phone.includes(q);
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>{availableDrivers.length === 0 ? 'No drivers available' : 'No drivers match your search'}</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {filtered.map((driver) => (
                            <div
                              key={driver.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm truncate">
                                    {driver.user?.firstname} {driver.user?.lastname}
                                  </p>
                                  {driver.isActive && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500 shrink-0"
                                    >
                                      Active
                                    </Badge>
                                  )}
                                  {driver.currentOrder && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:text-white dark:border-amber-500 shrink-0"
                                    >
                                      On delivery
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                  <span className="truncate">{driver.user?.phoneNumber}</span>
                                  {driver.distanceToPickup !== undefined && driver.distanceToPickup !== Infinity && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                      📍 {driver.distanceToPickup.toFixed(1)} km away
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAssignDriver(driver.id)}
                                disabled={assigningDriverId === driver.id}
                                className="ml-4 shrink-0"
                              >
                                {assigningDriverId === driver.id ? 'Assigning...' : 'Assign'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </ScrollArea>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Cannot Assign Driver</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.driver 
                          ? 'This order already has a driver assigned.'
                          : `This order is ${selectedOrder.status} and cannot be assigned a driver. Only PAID orders can be assigned.`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Info - Hide when showing assignment first */}
              {!shouldScrollToAssign && (
                <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold text-primary">{selectedOrder.price?.toLocaleString()} ETB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{selectedOrder.weightKg} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-semibold">{selectedOrder.distanceKm?.toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Pickup Address
                  </p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedOrder.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Delivery Address
                  </p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedOrder.deliveryAddress}</p>
                </div>
              </div>
                </>
              )}

              {/* Driver Assignment - Show at bottom when opened normally */}
              {!shouldScrollToAssign && selectedOrder.status === 'PAID' && (
                <div ref={assignSectionRef} className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Assign Driver</h3>

                  {/* Driver search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search drivers by name or phone..."
                        value={driverSearch}
                        onChange={(e) => setDriverSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[320px]">
                    {(() => {
                      const q = driverSearch.toLowerCase();
                      const filtered = availableDrivers.filter((driver) => {
                        const name = `${driver.user?.firstname || ''} ${driver.user?.lastname || ''}`.toLowerCase();
                        const phone = (driver.user?.phoneNumber || '').toLowerCase();
                        return !q || name.includes(q) || phone.includes(q);
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No drivers match your search</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {filtered.map((driver) => (
                            <div
                              key={driver.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm truncate">
                                    {driver.user?.firstname} {driver.user?.lastname}
                                  </p>
                                  {driver.isActive && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500 shrink-0"
                                    >
                                      Active
                                    </Badge>
                                  )}
                                  {driver.currentOrder && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:text-white dark:border-amber-500 shrink-0"
                                    >
                                      On delivery
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                  <span className="truncate">{driver.user?.phoneNumber}</span>
                                  {driver.distanceToPickup !== undefined && driver.distanceToPickup !== Infinity && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                      📍 {driver.distanceToPickup.toFixed(1)} km away
                                    </span>
                                  )}
                                  {driver.currentOrder && (
                                    <span className="text-amber-600 dark:text-amber-400 truncate">
                                      Currently: {driver.currentOrder.pickupAddress} → {driver.currentOrder.deliveryAddress}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAssignDriver(driver.id)}
                                disabled={assigningDriverId === driver.id}
                                className="shrink-0 ml-2"
                              >
                                {assigningDriverId === driver.id ? 'Assigning...' : 'Assign'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </ScrollArea>
                </div>
              )}

              {selectedOrder.driver && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Assigned Driver</h3>
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedOrder.driver.user?.firstname} {selectedOrder.driver.user?.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.driver.user?.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Package className="w-12 h-12 mb-4 opacity-50" />
              <p>No order selected</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

