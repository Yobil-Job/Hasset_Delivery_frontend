import { useState, useEffect } from 'react';
import { Map } from 'lucide-react';
import { GlassCard } from '../global/GlassCard';
import { LiveTrackingMap } from '../LiveTrackingMap';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

export function LiveMapSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allOrders = await adminService.getAllOrders().catch(() => []);
      setOrders(allOrders || []);
      
      // Select first active order if available
      const activeOrder = (allOrders || []).find((o: any) => 
        ['CREATED', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(o.status) && o.driver
      );
      if (activeOrder) {
        setSelectedOrderNumber(activeOrder.orderNumber);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter((o: any) => 
    ['CREATED', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(o.status) && o.driver
  );

  const selectedOrder = selectedOrderNumber 
    ? orders.find((o: any) => o.orderNumber === selectedOrderNumber)
    : null;

  const renderMapContent = () => {
    if (!selectedOrderNumber) {
      return (
        <div className="h-[600px] rounded-lg border border-border flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select an order to view live tracking</p>
          </div>
        </div>
      );
    }

    if (!selectedOrder) {
      return (
        <div className="h-[600px] rounded-lg border border-border flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Order not found</p>
          </div>
        </div>
      );
    }

    // Use delivery coordinates as default, fallback to pickup
    const driverLat = selectedOrder.deliveryLatitude || selectedOrder.pickupLatitude || 9.1450;
    const driverLng = selectedOrder.deliveryLongitude || selectedOrder.pickupLongitude || 38.7618;
    const driverName = selectedOrder.driver 
      ? `${selectedOrder.driver.user?.firstname || ''} ${selectedOrder.driver.user?.lastname || ''}`.trim() || 'Driver'
      : 'Driver';

    return (
      <div className="h-[600px] rounded-lg overflow-hidden border border-border">
        <LiveTrackingMap
          latitude={driverLat}
          longitude={driverLng}
          driverName={driverName}
          pickup={selectedOrder.pickupLatitude && selectedOrder.pickupLongitude ? {
            lat: selectedOrder.pickupLatitude,
            lng: selectedOrder.pickupLongitude
          } : undefined}
          destination={selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude ? {
            lat: selectedOrder.deliveryLatitude,
            lng: selectedOrder.deliveryLongitude
          } : undefined}
        />
      </div>
    );
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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Live Map View</h1>
        <p className="text-muted-foreground">Track active deliveries in real-time</p>
      </div>

      <GlassCard className="p-6">
          {activeOrders.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Active Deliveries</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeOrders.length} delivery{activeOrders.length !== 1 ? 'ies' : ''} in progress
                  </p>
                </div>
                <select
                  value={selectedOrderNumber || ''}
                  onChange={(e) => setSelectedOrderNumber(e.target.value || null)}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select an order to track</option>
                  {activeOrders.map((order: any) => (
                    <option key={order.orderNumber} value={order.orderNumber}>
                      {order.orderNumber} - {order.status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {renderMapContent()}
            </div>
          ) : (
            <div className="h-[600px] rounded-lg border border-border flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active deliveries to track</p>
              </div>
            </div>
          )}
        </GlassCard>
    </div>
  );
}

