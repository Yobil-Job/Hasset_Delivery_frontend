import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card3D } from '../global/Card3D';
import { GlassCard } from '../global/GlassCard';
import { Settings, Package, DollarSign, CreditCard, Plus, Edit, Trash2, Truck, Zap, MapPin, Clock, Shield, Rocket, Star, Heart, Gift } from 'lucide-react';
import { PricingConfigTab } from './PricingConfigTab';
import { SubscriptionPlansTab } from './SubscriptionPlansTab';
import { adminService } from '../../services/adminService';
import { ServiceOffering } from '../../services/pricing';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'motion/react';

const iconMap: { [key: string]: any } = {
  Package,
  Truck,
  Zap,
  MapPin,
  Clock,
  Shield,
  Rocket,
  Star,
  Heart,
  Gift,
};

const iconOptions = [
  { label: 'Package Box', value: 'Package' },
  { label: 'Delivery Truck', value: 'Truck' },
  { label: 'Lightning Fast', value: 'Zap' },
  { label: 'Location Pin', value: 'MapPin' },
  { label: 'Clock/Time', value: 'Clock' },
  { label: 'Shield/Security', value: 'Shield' },
  { label: 'Rocket/Speed', value: 'Rocket' },
  { label: 'Star/Premium', value: 'Star' },
  { label: 'Heart/Care', value: 'Heart' },
  { label: 'Gift/Special', value: 'Gift' }
];

const gradientOptions = [
  { label: 'Ocean Blue', value: 'from-blue-600 to-cyan-600', preview: 'from-blue-600 to-cyan-600' },
  { label: 'Purple Dream', value: 'from-purple-600 to-pink-600', preview: 'from-purple-600 to-pink-600' },
  { label: 'Sunset Orange', value: 'from-orange-600 to-red-600', preview: 'from-orange-600 to-red-600' },
  { label: 'Forest Green', value: 'from-green-600 to-teal-600', preview: 'from-green-600 to-teal-600' },
  { label: 'Royal Purple', value: 'from-indigo-600 to-purple-600', preview: 'from-indigo-600 to-purple-600' },
  { label: 'Golden Yellow', value: 'from-yellow-600 to-orange-600', preview: 'from-yellow-600 to-orange-600' },
  { label: 'Rose Pink', value: 'from-pink-600 to-rose-600', preview: 'from-pink-600 to-rose-600' },
  { label: 'Sky Blue', value: 'from-cyan-600 to-blue-600', preview: 'from-cyan-600 to-blue-600' },
  { label: 'Luxury Purple-Pink', value: 'from-purple-600 via-pink-500 to-rose-500', preview: 'from-purple-600 via-pink-500 to-rose-500' }
];

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Service Management State
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    priceText: '',
    features: '',
    imageUrl: '',
    gradient: 'from-blue-600 to-cyan-600',
    icon: 'Package',
    multiplier: 1.0
  });

  // Pricing Configuration State
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    baseFee: 0,
    distanceRatePerKm: 0,
    freeWeightLimit: 0,
    additionalWeightFeePerKg: 0
  });

  // Subscription Plans State
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    period: 'per month',
    features: '',
    badge: '',
    popular: false,
    gradient: 'from-blue-600 to-cyan-600',
    icon: 'Package',
    amount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allServices, pricing, plans] = await Promise.all([
        adminService.getAllServices().catch(() => []),
        adminService.getPricingConfig().catch(() => null),
        adminService.getSubscriptionPlans().catch(() => [])
      ]);
      setServices(allServices || []);
      setPricingConfig(pricing && pricing.length > 0 ? pricing[0] : null);
      setSubscriptionPlans(plans || []);
    } catch (error) {
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  // Service Handlers
  const handleOpenServiceDialog = (service?: ServiceOffering) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        title: service.title,
        description: service.description,
        priceText: service.priceText,
        features: service.features.join(', '),
        imageUrl: service.imageUrl,
        gradient: service.gradient,
        icon: service.icon,
        multiplier: service.multiplier
      });
    } else {
      setEditingService(null);
      setServiceForm({
        title: '',
        description: '',
        priceText: '',
        features: '',
        imageUrl: '',
        gradient: 'from-blue-600 to-cyan-600',
        icon: 'Package',
        multiplier: 1.0
      });
    }
    setIsServiceDialogOpen(true);
  };

  const handleSaveService = async () => {
    try {
      const serviceData = {
        title: serviceForm.title,
        description: serviceForm.description,
        priceText: serviceForm.priceText,
        features: serviceForm.features.split(',').map(f => f.trim()).filter(f => f),
        imageUrl: serviceForm.imageUrl,
        gradient: serviceForm.gradient,
        icon: serviceForm.icon,
        multiplier: serviceForm.multiplier
      };

      if (editingService) {
        await adminService.updateService(editingService.id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await adminService.createService(serviceData);
        toast.success('Service created successfully');
      }
      setIsServiceDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await adminService.deleteService(id);
      toast.success('Service deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  // Pricing Handlers
  const handleOpenPricingDialog = () => {
    if (pricingConfig) {
      setPricingForm({
        baseFee: pricingConfig.baseFee,
        distanceRatePerKm: pricingConfig.distanceRatePerKm,
        freeWeightLimit: pricingConfig.freeWeightLimit,
        additionalWeightFeePerKg: pricingConfig.additionalWeightFeePerKg
      });
    } else {
      setPricingForm({
        baseFee: 0,
        distanceRatePerKm: 0,
        freeWeightLimit: 0,
        additionalWeightFeePerKg: 0
      });
    }
    setIsPricingDialogOpen(true);
  };

  const handleSavePricingConfig = async () => {
    try {
      if (pricingConfig) {
        await adminService.updatePricingConfig(pricingConfig.id, pricingForm);
        toast.success('Pricing configuration updated successfully');
      } else {
        await adminService.createPricingConfig(pricingForm);
        toast.success('Pricing configuration created successfully');
      }
      setIsPricingDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save pricing configuration');
    }
  };

  // Plan Handlers
  const handleOpenPlanDialog = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        period: plan.period,
        features: plan.features.join(', '),
        badge: plan.badge,
        popular: plan.popular,
        gradient: plan.gradient,
        icon: plan.icon,
        amount: plan.amount
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: '',
        description: '',
        price: '',
        period: 'per month',
        features: '',
        badge: '',
        popular: false,
        gradient: 'from-blue-600 to-cyan-600',
        icon: 'Package',
        amount: 0
      });
    }
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      const planData = {
        name: planForm.name,
        description: planForm.description,
        price: planForm.price,
        period: planForm.period,
        features: planForm.features.split(',').map(f => f.trim()).filter(f => f),
        badge: planForm.badge,
        popular: planForm.popular,
        gradient: planForm.gradient,
        icon: planForm.icon,
        amount: planForm.amount
      };

      if (editingPlan) {
        await adminService.updateSubscriptionPlan(editingPlan.id, planData);
        toast.success('Subscription plan updated successfully');
      } else {
        await adminService.createSubscriptionPlan(planData);
        toast.success('Subscription plan created successfully');
      }
      setIsPlanDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save subscription plan');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await adminService.deleteSubscriptionPlan(id);
      toast.success('Subscription plan deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete subscription plan');
    }
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage services, pricing, and subscription plans</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Card3D>
          <GlassCard className="p-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">
                <Package className="h-4 w-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <DollarSign className="h-4 w-4 mr-2" />
                Pricing Config
              </TabsTrigger>
              <TabsTrigger value="plans">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription Plans
              </TabsTrigger>
            </TabsList>
          </GlassCard>
        </Card3D>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card3D>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Service Offerings</h2>
                <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenServiceDialog()} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingService ? 'Edit' : 'Create'} Service</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={serviceForm.title}
                          onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={serviceForm.description}
                          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priceText">Price Text</Label>
                        <Input
                          id="priceText"
                          value={serviceForm.priceText}
                          onChange={(e) => setServiceForm({ ...serviceForm, priceText: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="features">Features (comma-separated)</Label>
                        <Textarea
                          id="features"
                          value={serviceForm.features}
                          onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={serviceForm.imageUrl}
                          onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="icon">Icon</Label>
                        <Select value={serviceForm.icon} onValueChange={(value) => setServiceForm({ ...serviceForm, icon: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="gradient">Gradient</Label>
                        <Select value={serviceForm.gradient} onValueChange={(value) => setServiceForm({ ...serviceForm, gradient: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gradientOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="multiplier">Multiplier</Label>
                        <Input
                          id="multiplier"
                          type="number"
                          step="0.1"
                          value={serviceForm.multiplier}
                          onChange={(e) => setServiceForm({ ...serviceForm, multiplier: parseFloat(e.target.value) })}
                        />
                      </div>
                      <Button onClick={handleSaveService}>
                        {editingService ? 'Update' : 'Create'} Service
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => {
                  const IconComponent = iconMap[service.icon] || iconMap.Package;
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <GlassCard className="p-4">
                        <div className={`bg-gradient-to-br ${service.gradient} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1">{service.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenServiceDialog(service)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </Card3D>
        </TabsContent>

        {/* Pricing Config Tab */}
        <TabsContent value="pricing">
          <PricingConfigTab
            pricingConfig={pricingConfig}
            isPricingDialogOpen={isPricingDialogOpen}
            setIsPricingDialogOpen={setIsPricingDialogOpen}
            pricingForm={pricingForm}
            setPricingForm={setPricingForm}
            handleOpenPricingDialog={handleOpenPricingDialog}
            handleSavePricingConfig={handleSavePricingConfig}
          />
        </TabsContent>

        {/* Subscription Plans Tab */}
        <TabsContent value="plans">
          <SubscriptionPlansTab
            subscriptionPlans={subscriptionPlans}
            isPlanDialogOpen={isPlanDialogOpen}
            setIsPlanDialogOpen={setIsPlanDialogOpen}
            editingPlan={editingPlan}
            planForm={planForm}
            setPlanForm={setPlanForm}
            handleOpenPlanDialog={handleOpenPlanDialog}
            handleSavePlan={handleSavePlan}
            handleDeletePlan={handleDeletePlan}
            iconOptions={iconOptions}
            gradientOptions={gradientOptions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

