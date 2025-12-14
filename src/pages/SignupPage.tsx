import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ArrowRight, Package, Building, Phone, Car, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { SEO } from '../components/global/SEO';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { authService } from '../services/auth';
import { driverService } from '../services/driverService';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordValidator';
import { sanitizeName, sanitizeEmail, sanitizePhone } from '../utils/sanitize';
import { validateName, validateEmail, validatePhone } from '../utils/inputValidator';

export function SignupPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'customer' | 'driver'>('customer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    company: '',
    vehicleType: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
    accountType: 'personal',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent double submission
    
    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0] || 'Password does not meet requirements');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      // SECURITY: Sanitize and validate all inputs
      const sanitizedFullName = sanitizeName(formData.fullName);
      const nameValidation = validateName(sanitizedFullName, 'Full Name');
      if (!nameValidation.isValid) {
        toast.error(nameValidation.error || 'Invalid name');
        setIsLoading(false);
        return;
      }
      
      const sanitizedEmail = sanitizeEmail(formData.email);
      const emailValidation = validateEmail(sanitizedEmail);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.error || 'Invalid email');
        setIsLoading(false);
        return;
      }
      
      if (formData.phoneNumber) {
        const sanitizedPhone = sanitizePhone(formData.phoneNumber);
        const phoneValidation = validatePhone(sanitizedPhone);
        if (!phoneValidation.isValid) {
          toast.error(phoneValidation.error || 'Invalid phone number');
          setIsLoading(false);
          return;
        }
      }
      
      const trimmedName = sanitizedFullName.trim();
      const nameParts = trimmedName.split(/\s+/);
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(' ').trim();

      if (!firstname || !lastname) {
        toast.error('Please enter both first name and last name');
        setIsLoading(false);
        return;
      }

      // SECURITY: Use sanitized values
      const sanitizedPhone = formData.phoneNumber ? sanitizePhone(formData.phoneNumber) : '';
      
      if (userType === 'driver') {
        await driverService.registerDriver({
          firstname,
          lastname,
          email: sanitizedEmail,
          phoneNumber: sanitizedPhone,
          password: formData.password,
          vehicleType: sanitizeName(formData.vehicleType),
          licenseNumber: sanitizeName(formData.licenseNumber)
        });
        toast.success('Driver registration submitted! Please verify your email.');
        navigate(`/verify-email?email=${encodeURIComponent(sanitizedEmail)}`, { replace: true });
        return;
      } else {
        const response = await authService.signup({
          firstname,
          lastname,
          email: sanitizedEmail,
          phoneNumber: sanitizedPhone,
          password: formData.password,
          accountType: formData.accountType,
          address: formData.company ? sanitizeName(formData.company) : undefined
        });
        
        // Check if email was sent successfully
        if (response?.emailSent === false) {
          toast.warning('Account created, but verification email could not be sent. You can request a new code from the login page.');
        } else {
          toast.success('Account created successfully! Please verify your email.');
        }
        
        navigate(`/verify-email?email=${encodeURIComponent(sanitizedEmail)}`, { replace: true });
        return;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle error messages with user-friendly messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        // Check if it's an email sending error
        if (error.response.data.error.toLowerCase().includes('email') || 
            error.response.data.error.toLowerCase().includes('unable to send')) {
          errorMessage = 'Account created, but we couldn\'t send the verification email. Please try logging in to request a new verification code.';
        } else {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SEO
        title="Sign Up - ሀሴት Delivery"
        description="Create your ሀሴት Delivery account and start shipping with confidence."
      />

      {/* Left Side - Hero */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-orange-600">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {userType === 'driver' ? (
                <Car className="h-24 w-24 mx-auto mb-8" />
              ) : (
                <Package className="h-24 w-24 mx-auto mb-8" />
              )}
              <h2 className="text-4xl mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {userType === 'driver' ? 'Become a Driver' : 'Start Shipping Today'}
              </h2>
              <p className="text-xl text-white/90 max-w-md mx-auto mb-12">
                {userType === 'driver'
                  ? 'Join our delivery network and earn on your schedule'
                  : 'Join our platform and experience seamless delivery services'}
              </p>

              <div className="space-y-4 max-w-md mx-auto text-left">
                {(userType === 'driver' ? [
                  'Flexible working hours',
                  'Competitive earnings',
                  'Weekly payouts',
                  'Insurance coverage',
                  'Dedicated support team',
                ] : [
                  'Real-time package tracking',
                  'Competitive pricing with no hidden fees',
                  'Worldwide delivery network',
                  '24/7 customer support',
                  'Easy integration with your business',
                ]).map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)', x: 5 }}
                  >
                    <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
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
                Create Account
              </h1>
              <p className="text-muted-foreground">
                Get started with your free account
              </p>
            </div>

            {/* User Type Selection */}
            <div className="mb-6">
              <Label>I want to register as</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <motion.button
                  type="button"
                  onClick={() => setUserType('customer')}
                  className={`p-4 rounded-xl border-2 transition-all ${userType === 'customer'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Customer</p>
                  <p className="text-xs text-muted-foreground">Send packages</p>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setUserType('driver')}
                  className={`p-4 rounded-xl border-2 transition-all ${userType === 'driver'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Car className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Driver</p>
                  <p className="text-xs text-muted-foreground">Deliver packages</p>
                </motion.button>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => {
                        const sanitized = sanitizeName(e.target.value);
                        setFormData({ ...formData, fullName: sanitized });
                      }}
                      required
                      className="pl-10 h-12"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().trim();
                        setFormData({ ...formData, email: value });
                      }}
                      required
                      className="pl-10 h-12"
                      maxLength={254}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251 9..."
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const sanitized = sanitizePhone(e.target.value);
                        setFormData({ ...formData, phoneNumber: sanitized });
                      }}
                      required
                      className="pl-10 h-12"
                      maxLength={16}
                    />
                  </div>
                </div>

                {userType === 'customer' ? (
                  <>
                    <div>
                      <Label htmlFor="company">Company Name (Optional)</Label>
                      <div className="relative mt-2">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Your Company Inc."
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Account Type</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="accountType"
                            value="personal"
                            checked={formData.accountType === 'personal'}
                            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                            className="accent-primary"
                          />
                          Personal
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="accountType"
                            value="business"
                            checked={formData.accountType === 'business'}
                            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                            className="accent-primary"
                          />
                          Business
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <div className="relative mt-2">
                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="vehicleType"
                          type="text"
                          placeholder="Motorcycle, Car, Van"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          required
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <div className="relative mt-2">
                        <Input
                          id="licenseNumber"
                          type="text"
                          placeholder="DL123456"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pl-10 h-12 bg-card text-foreground border-border"
                    />
                  </div>
                  <PasswordStrengthIndicator password={formData.password} />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="pl-10 h-12 bg-card text-foreground border-border"
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Passwords match</p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked: boolean) => setAgreeToTerms(checked)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link to="#" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="#" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <motion.div whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}}>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-orange-600 h-12" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {userType === 'driver' ? 'Registering...' : 'Creating Account...'}
                      </>
                    ) : (
                      <>
                        {userType === 'driver' ? 'Register as Driver' : 'Create Account'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>

            <p className="text-center mt-8 text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}