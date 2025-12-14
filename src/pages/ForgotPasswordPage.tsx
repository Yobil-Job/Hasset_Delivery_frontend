import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { SEO } from '../components/global/SEO';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { toast } from 'sonner';
import { authService } from '../services/auth';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset code sent to your email.');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to send reset code. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Forgot Password - ሀሴት Delivery" description="Reset your ሀሴት Delivery password." />
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8">
        <ScrollReveal>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email and we&apos;ll send you a 6-digit code to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Code'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </ScrollReveal>
      </div>
    </div>
  );
}


