import { Dialog, DialogContent } from '../ui/dialog';
import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle, ChevronRight, Lock, ArrowLeft, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card3D } from './Card3D';
import { GlassCard } from './GlassCard';
import { ScrollReveal } from './ScrollReveal';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type PaymentMethod = 'telebirr' | 'cbebirr' | 'amole' | 'hellocash' | 'bank' | 'visa' | 'mastercard' | 'paypal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails?: {
    orderId: string;
    amount: number;
    items: string[];
  };
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, orderDetails, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'details' | 'confirm' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [email, setEmail] = useState('');

  // Default order details if none provided
  const order = orderDetails || {
    orderId: 'PLAN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    amount: 2500,
    items: ['Business Plan Subscription', '15% discount on shipments', 'Priority support']
  };

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const localPaymentMethods = [
    {
      id: 'telebirr' as PaymentMethod,
      name: 'Telebirr',
      icon: Smartphone,
      gradient: 'from-orange-500 to-red-500',
      description: 'Pay with Telebirr mobile wallet'
    },
    {
      id: 'cbebirr' as PaymentMethod,
      name: 'CBE Birr',
      icon: Building2,
      gradient: 'from-green-500 to-emerald-600',
      description: 'Commercial Bank of Ethiopia'
    },
    {
      id: 'amole' as PaymentMethod,
      name: 'Amole',
      icon: Wallet,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Pay with Amole wallet'
    },
    {
      id: 'hellocash' as PaymentMethod,
      name: 'HelloCash',
      icon: Smartphone,
      gradient: 'from-purple-500 to-pink-500',
      description: 'HelloCash mobile payment'
    }
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleContinueToDetails = () => {
    setStep('details');
  };

  const handleContinueToConfirm = () => {
    if (['telebirr', 'cbebirr', 'amole', 'hellocash'].includes(paymentMethod)) {
      if (!phoneNumber || phoneNumber.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
    }
    setStep('confirm');
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      toast.success('Payment processed successfully!');
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const resetModal = () => {
    setStep('method');
    setPaymentMethod('telebirr');
    setIsProcessing(false);
    setPhoneNumber('');
    setAccountNumber('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardName('');
    setEmail('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSuccessClose = () => {
    resetModal();
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-6 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Payment Method</h2>
        <p className="text-muted-foreground">Select your preferred payment option</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localPaymentMethods.map((method, index) => (
          <Card3D key={method.id}>
            <motion.div
              onClick={() => handleMethodSelect(method.id)}
              className={`cursor-pointer transition-all ${
                paymentMethod === method.id ? 'ring-2 ring-primary' : ''
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`bg-gradient-to-br ${method.gradient} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                    animate={paymentMethod === method.id ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <method.icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{method.name}</h3>
                      {paymentMethod === method.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </Card3D>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleContinueToDetails}
            size="lg"
            className="bg-gradient-to-r from-primary to-orange-600"
          >
            Continue to Payment Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );

  const renderPaymentDetails = () => (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setStep('method')}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Payment Details</h2>
          <p className="text-sm text-muted-foreground">Enter your payment information</p>
        </div>
      </div>

      <Card3D>
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+251 9XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You will receive a confirmation SMS
              </p>
            </div>
          </div>
        </GlassCard>
      </Card3D>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep('method')}
        >
          Back
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleContinueToConfirm}
            size="lg"
            className="bg-gradient-to-r from-primary to-orange-600"
          >
            Review Order
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setStep('details')}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Confirm Payment</h2>
          <p className="text-sm text-muted-foreground">Review your order details</p>
        </div>
      </div>

      <Card3D>
        <GlassCard className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="text-foreground">{order.orderId}</span>
            </div>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item}</span>
                <span className="text-foreground">✓</span>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="text-xl text-primary font-bold">
                  {formatCurrency(order.amount)}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </Card3D>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep('details')}
        >
          Back
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleProcessPayment}
            disabled={isProcessing}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Lock className="h-4 w-4" />
                </motion.div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay {formatCurrency(order.amount)}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mx-auto mb-6"
      >
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
      <p className="text-muted-foreground mb-6">
        Thank you for your payment of {formatCurrency(order.amount)}
      </p>

      <Card3D>
        <GlassCard className="p-4 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="text-foreground">{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-foreground">{formatCurrency(order.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </GlassCard>
      </Card3D>

      <Button
        onClick={handleSuccessClose}
        className="w-full mt-6 bg-gradient-to-r from-primary to-orange-600"
        size="lg"
      >
        Close
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 bg-background/80 backdrop-blur-sm border rounded-full w-8 h-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="bg-gradient-to-br from-background via-primary/5 to-background p-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 'method' && renderMethodSelection()}
                {step === 'details' && renderPaymentDetails()}
                {step === 'confirm' && renderConfirmation()}
                {step === 'success' && renderSuccess()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}