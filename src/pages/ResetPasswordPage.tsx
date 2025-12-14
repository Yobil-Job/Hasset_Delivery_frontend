import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Package, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { OTPInput } from '../components/ui/otp-input';
import { SEO } from '../components/global/SEO';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { authService } from '../services/auth';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordValidator';

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit reset code');
      return;
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0] || 'Password does not meet requirements');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email, code, password);
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to reset password. Please check the code and try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <SEO title="Reset Password - ሀሴት Delivery" description="Set a new password for your account." />
      
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 group justify-center">
          <div className="bg-gradient-to-br from-primary to-orange-600 p-2 rounded-xl">
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
            ሀሴት Delivery
          </span>
        </Link>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-lg"
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full p-4 mb-4"
              >
                <Package className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
                Reset Your Password
              </h1>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Enter the 6-digit code you received via email and choose a new secure password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Display */}
              {initialEmail ? (
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <Label className="text-xs text-muted-foreground mb-1 block">Email Address</Label>
                  <p className="text-sm font-medium text-foreground">{email}</p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 h-12 bg-background border-border text-foreground"
                    placeholder="you@example.com"
                  />
                </div>
              )}

              {/* OTP Input */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-4 block text-center">
                  Enter Reset Code
                </Label>
                <OTPInput
                  value={code}
                  onChange={setCode}
                  length={6}
                  disabled={isLoading}
                />
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
                <div className="relative mt-2 w-full">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 h-12 bg-background border-border text-foreground"
                    placeholder="Enter new password"
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <div className="relative mt-2 w-full">
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 h-12 bg-background border-border text-foreground"
                    placeholder="Confirm new password"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && password && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Passwords match</p>
                )}
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-orange-600 text-white font-semibold"
                  disabled={isLoading || code.length !== 6 || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Back to Login */}
              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          </motion.div>
      </div>
    </div>
  );
}


