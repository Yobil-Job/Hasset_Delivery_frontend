import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { OTPInput } from '../components/ui/otp-input';
import { SEO } from '../components/global/SEO';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { authService } from '../services/auth';

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      await authService.verifyEmail(email, code);
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        'Verification failed. Please check the code and try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <SEO title="Verify Email - ሀሴት Delivery" description="Verify your email address for ሀሴት Delivery." />
     
      
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
                <Mail className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
                Verify Your Email
              </h1>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                We&apos;ve sent a 6-digit verification code to <span className="font-semibold text-foreground">{email || 'your email'}</span>. 
                Please enter it below to complete your registration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Display (read-only if provided) */}
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
                  Enter Verification Code
                </Label>
                <OTPInput
                  value={code}
                  onChange={setCode}
                  length={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Didn&apos;t receive the code? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        toast.error('Please enter your email first');
                        return;
                      }
                      try {
                        setIsLoading(true);
                        await authService.resendVerificationCode(email);
                        toast.success('Verification code resent! Please check your email.');
                        setCode(''); // Clear the code input
                      } catch (error: any) {
                        const msg =
                          error?.response?.data?.error ||
                          error?.message ||
                          'Failed to resend code. Please try again.';
                        toast.error(msg);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    request a new one
                  </button>
                </p>
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-orange-600 text-white font-semibold"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Email
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


