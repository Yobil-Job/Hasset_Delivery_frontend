import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { SEO } from '../components/global/SEO';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { authService } from '../services/auth';
import { getSafeRedirectUrl } from '../utils/redirect';
import { sanitizeEmail } from '../utils/sanitize';
import { validateEmail } from '../utils/inputValidator';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState<string>('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time validation
    if (value) {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        setEmailError(validation.error || '');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Validate and sanitize inputs before submission
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || 'Invalid email address');
      return;
    }
    
    if (!password || password.length === 0) {
      toast.error('Password is required');
      return;
    }
    
    // SECURITY: Sanitize email before sending
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      toast.error('Invalid email address');
      return;
    }
    
    try {
      const response = await authService.login({ email: sanitizedEmail, password });

      // Block ADMIN from logging in via this page
      if (response.role === 'ADMIN') {
        toast.error('Admin users cannot login here. Please use the admin portal.');
        localStorage.clear();
        return;
      }

      toast.success('Login successful!');

      // SECURITY: Get safe redirect URL from query params or use default
      const redirectUrl = getSafeRedirectUrl(searchParams, '/');
      
      // Redirect based on role
      if (response.role === 'DRIVER') {
        navigate('/driver/dashboard', { replace: true });
      } else {
        navigate(redirectUrl, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle error messages (now thrown as Error objects from authService)
      const errorMessage = error.message || 
                          error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Login failed. Please check your credentials.';
      
      // If email is not verified, redirect to verification page
      if (error.response?.status === 403 || errorMessage.toLowerCase().includes('not verified') || errorMessage.toLowerCase().includes('verification')) {
        toast.error('Please verify your email address before logging in.');
        // SECURITY: Sanitize email in URL
        navigate(`/verify-email?email=${encodeURIComponent(sanitizedEmail)}`, { replace: true });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      <SEO
        title="Login - ሀሴት Delivery"
        description="Login to your ሀሴት Delivery account to manage shipments, track packages, and access exclusive features."
      />

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <ScrollReveal>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8 group">
              <div className="bg-gradient-to-br from-primary to-orange-600 p-2 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ሀሴት Delivery
              </span>
            </Link>

            <div className="mb-8">
              <h1 className="text-4xl text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to access your account
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      className="pl-10 h-12 bg-card text-foreground border-border"
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 mt-1">{emailError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 h-12 bg-card text-foreground border-border"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-orange-600 h-12" size="lg">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" variant="outline" className="h-12 w-full">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" variant="outline" className="h-12 w-full">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      GitHub
                    </Button>
                  </motion.div>
                </div>
              </form>
            </div>

            <p className="text-center mt-8 text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-orange-600">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Package className="h-24 w-24 mx-auto mb-8" />
              <h2 className="text-4xl text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Welcome to ሀሴት Delivery
              </h2>
              <p className="text-xl text-white/90 max-w-md mx-auto">
                Join thousands of businesses that trust ሀሴት for their delivery needs
              </p>

              <div className="grid grid-cols-3 gap-6 mt-12 max-w-xl mx-auto">
                {[
                  { value: '10K+', label: 'Daily Shipments' },
                  { value: '98%', label: 'On-Time Rate' },
                  { value: '50+', label: 'Countries' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <div className="text-3xl mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}