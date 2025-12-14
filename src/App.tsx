import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { useNotifications } from './hooks/useNotifications';
import { Header } from './components/global/Header';
import { Footer } from './components/global/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { PricingPage } from './pages/PricingPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PaymentPage } from './pages/PaymentPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { AddressBookPage } from './pages/AddressBookPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { RoleRoute } from './components/auth/RoleRoute';
import { DriverDashboardPage } from './pages/driver/DriverDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { DriverSignupPage } from './pages/DriverSignupPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

function AppContent() {
  useNotifications(); // Initialize notifications

  return (
    <Router>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Auth pages without header/footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/driver/signup" element={<DriverSignupPage />} />
            <Route path="/sys-admin-portal-x9k2" element={<AdminLoginPage />} />

            {/* Dashboard pages without header/footer */}
            <Route element={<RoleRoute allowedRoles={['DRIVER']} />}>
              <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            </Route>

            {/* Main pages with header/footer */}
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/addresses" element={<AddressBookPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/order/create" element={<CreateOrderPage />} />
                      <Route path="/order/success/:orderNumber" element={<OrderSuccessPage />} />
                      <Route path="/orders" element={<MyOrdersPage />} />
                      <Route path="/orders/:orderNumber" element={<OrderDetailsPage />} />
                      <Route path="/payments/result" element={<PaymentResultPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
