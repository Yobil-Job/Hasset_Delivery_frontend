import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Map,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { SEO } from '../../components/global/SEO';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { authService } from '../../services/auth';
import { ThemeToggle } from '../../components/global/ThemeToggle';

// Import all section components
import { DashboardSection } from '../../components/admin/DashboardSection';
import { OrdersSection } from '../../components/admin/OrdersSection';
import { CustomersSection } from '../../components/admin/CustomersSection';
import { DriversSection } from '../../components/admin/DriversSection';
import { AnalyticsSection } from '../../components/admin/AnalyticsSection';
import { SettingsSection } from '../../components/admin/SettingsSection';
import { LiveMapSection } from '../../components/admin/LiveMapSection';
import { PaymentsSection } from '../../components/admin/PaymentsSection';
import { FAQsSection } from '../../components/admin/FAQsSection';

export function AdminDashboardPage() {
    const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on component mount
    useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
          toast.error('Access Denied', {
            description: 'Please login to access the admin dashboard',
            duration: 3000,
          });
          navigate('/sys-admin-portal-x9k2');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        toast.error('Access Denied', {
          description: 'Please login to access the admin dashboard',
          duration: 3000,
        });
        navigate('/sys-admin-portal-x9k2');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      toast.success('Logged out successfully');
      navigate('/sys-admin-portal-x9k2');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      navigate('/sys-admin-portal-x9k2');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'drivers', label: 'Drivers', icon: Truck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Render the active section
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection onNavigate={setActiveSection} />;
      case 'orders':
        return <OrdersSection />;
      case 'customers':
        return <CustomersSection />;
      case 'drivers':
        return <DriversSection />;
      case 'payments':
        return <PaymentsSection />;
      case 'faqs':
        return <FAQsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'map':
        return <LiveMapSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardSection onNavigate={setActiveSection} />;
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
        return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SEO 
          title="Admin Dashboard - ሀሴት Delivery"
          description="Manage your delivery platform from the admin dashboard"
        />
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Admin Dashboard - ሀሴት Delivery"
        description="Manage your delivery platform from the admin dashboard"
      />
      
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
                                                    <Button
                                                        variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                                    </Button>

                                                <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-orange-600 p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
                                                </div>
              <span className="text-lg font-semibold">ሀሴት Admin</span>
                                            </div>
                                                </div>

                                                                            <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                type="text"
                placeholder="Search..."
                className="pl-9 w-64 h-9"
                                                />
                                    </div>

            <ThemeToggle />

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                                                                    </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                        size="sm"
              onClick={handleLogout}
              className="text-red-600"
            >
              <LogOut className="h-5 w-5" />
                                                                </Button>
                                                            </div>
                                                        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* Desktop Sidebar (always visible on medium+ screens, integrated with layout) */}
        <aside className="hidden md:flex md:flex-col w-64 bg-card border-r border-border">
          <div className="h-[calc(100vh-57px)] sticky top-[57px]">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground bg-transparent'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
                                                        </div>
        </aside>

        {/* Mobile Sidebar (slides over content, only on small screens) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border overflow-y-auto z-40 md:hidden"
            >
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground bg-transparent'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderSection()}
            </div>
        </main>
                                </div>
                                </div>
  );
}
