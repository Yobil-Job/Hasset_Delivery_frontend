import { useState } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Card3D } from '../components/global/Card3D';
import { GlassCard } from '../components/global/GlassCard';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

type PaymentMethod = 'telebirr' | 'cbebirr' | 'amole' | 'hellocash' | 'bank' | 'visa' | 'mastercard' | 'paypal';

interface PaymentPageProps {
  orderDetails?: {
    orderId: string;
    amount: number;
    items: string[];
  };
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PaymentPage({ orderDetails, onClose, onSuccess }: PaymentPageProps) {
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
    orderId: 'KRU' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    amount: 2500,
    items: ['Express Delivery', 'Insurance Coverage', 'Priority Handling']
  };

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
    },
    {
      id: 'bank' as PaymentMethod,
      name: 'Bank Transfer',
      icon: Building2,
      gradient: 'from-indigo-500 to-blue-600',
      description: 'Direct bank transfer'
    }
  ];

  const internationalPaymentMethods = [
    {
      id: 'visa' as PaymentMethod,
      name: 'Visa',
      icon: CreditCard,
      gradient: 'from-blue-600 to-blue-700',
      description: 'Visa credit/debit card'
    },
    {
      id: 'mastercard' as PaymentMethod,
      name: 'Mastercard',
      icon: CreditCard,
      gradient: 'from-red-500 to-orange-500',
      description: 'Mastercard credit/debit'
    },
    {
      id: 'paypal' as PaymentMethod,
      name: 'PayPal',
      icon: Wallet,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Pay with PayPal'
    }
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleContinueToDetails = () => {
    setStep('details');
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToConfirm = () => {
    // Validate based on payment method
    if (['telebirr', 'cbebirr', 'amole', 'hellocash'].includes(paymentMethod)) {
      if (!phoneNumber || phoneNumber.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
    } else if (paymentMethod === 'bank') {
      if (!accountNumber) {
        toast.error('Please enter your account number');
        return;
      }
    } else if (['visa', 'mastercard'].includes(paymentMethod)) {
      if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!email) {
        toast.error('Please enter your PayPal email');
        return;
      }
    }

    setStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      toast.success('Payment processed successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Call onSuccess callback after a delay
      if (onSuccess) {
        setTimeout(onSuccess, 3000);
      }
    }, 2500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const renderMethodSelection = () => (
    <div className="space-y-8">
      {/* Local Payment Methods */}
      <ScrollReveal>
        <div>
          <h2 className="text-3xl text-foreground mb-2">Ethiopian Payment Methods</h2>
          <p className="text-muted-foreground mb-6">Choose your preferred local payment option</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localPaymentMethods.map((method, index) => (
              <ScrollReveal key={method.id} delay={index * 0.05}>
                <Card3D>
                  <motion.div
                    onClick={() => handleMethodSelect(method.id)}
                    className={`cursor-pointer transition-all ${
                      paymentMethod === method.id ? 'ring-2 ring-primary' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex items-start gap-4">
                        <motion.div
                          className={`bg-gradient-to-br ${method.gradient} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                          animate={paymentMethod === method.id ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <method.icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg text-foreground">{method.name}</h3>
                            {paymentMethod === method.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-primary rounded-full p-1"
                              >
                                <CheckCircle className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* International Payment Methods */}
      <ScrollReveal delay={0.2}>
        <div>
          <h2 className="text-3xl text-foreground mb-2">International Payment Methods</h2>
          <p className="text-muted-foreground mb-6">Global payment options available</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {internationalPaymentMethods.map((method, index) => (
              <ScrollReveal key={method.id} delay={index * 0.05}>
                <Card3D>
                  <motion.div
                    onClick={() => handleMethodSelect(method.id)}
                    className={`cursor-pointer transition-all ${
                      paymentMethod === method.id ? 'ring-2 ring-primary' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GlassCard className="p-6">
                      <motion.div
                        className={`bg-gradient-to-br ${method.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
                        animate={paymentMethod === method.id ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <method.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg text-foreground">{method.name}</h3>
                        {paymentMethod === method.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-primary rounded-full p-1"
                          >
                            <CheckCircle className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </GlassCard>
                  </motion.div>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Continue Button */}
      <ScrollReveal delay={0.3}>
        <div className="flex justify-end">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleContinueToDetails}
              size="lg"
              className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500"
            >
              Continue to Payment Details
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </ScrollReveal>
    </div>
  );

  const renderPaymentDetails = () => {
    const selectedMethod = [...localPaymentMethods, ...internationalPaymentMethods].find(
      m => m.id === paymentMethod
    );

    return (
      <div className="space-y-8">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setStep('method')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl text-foreground">Payment Details</h2>
              <p className="text-muted-foreground">Enter your {selectedMethod?.name} details</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Card3D>
            <GlassCard className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className={`bg-gradient-to-br ${selectedMethod?.gradient} w-14 h-14 rounded-xl flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {selectedMethod?.icon && <selectedMethod.icon className="h-7 w-7 text-white" />}
                </motion.div>
                <div>
                  <h3 className="text-xl text-foreground">{selectedMethod?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMethod?.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Mobile wallet payment methods */}
                {['telebirr', 'cbebirr', 'amole', 'hellocash'].includes(paymentMethod) && (
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      You will receive a confirmation SMS to authorize the payment
                    </p>
                  </div>
                )}

                {/* Bank transfer */}
                {paymentMethod === 'bank' && (
                  <>
                    <div>
                      <Label htmlFor="account">Account Number</Label>
                      <Input
                        id="account"
                        type="text"
                        placeholder="Enter your bank account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm text-foreground">
                        <strong>Bank Details:</strong><br />
                        Bank: Commercial Bank of Ethiopia<br />
                        Account: 1000XXXXXXXX<br />
                        Reference: {order.orderId}
                      </p>
                    </div>
                  </>
                )}

                {/* Card payments */}
                {['visa', 'mastercard'].includes(paymentMethod) && (
                  <>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="mt-2"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="mt-2"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value)}
                          className="mt-2"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* PayPal */}
                {paymentMethod === 'paypal' && (
                  <div>
                    <Label htmlFor="email">PayPal Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll be redirected to PayPal to complete the payment
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </Card3D>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep('method')}
            >
              Back to Payment Methods
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleContinueToConfirm}
                size="lg"
                className="bg-gradient-to-r from-primary to-orange-600"
              >
                Review Order
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    );
  };

  const renderConfirmation = () => {
    const selectedMethod = [...localPaymentMethods, ...internationalPaymentMethods].find(
      m => m.id === paymentMethod
    );

    return (
      <div className="space-y-8">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setStep('details')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl text-foreground">Confirm Payment</h2>
              <p className="text-muted-foreground">Review your order and payment details</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Order Summary */}
        <ScrollReveal delay={0.1}>
          <Card3D>
            <GlassCard className="p-8">
              <h3 className="text-xl text-foreground mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="text-foreground">{order.orderId}</span>
                </div>
                
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{item}</span>
                    <span className="text-foreground">✓</span>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-foreground">Total Amount</span>
                    <span className="text-2xl text-primary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Card3D>
        </ScrollReveal>

        {/* Payment Method Summary */}
        <ScrollReveal delay={0.2}>
          <Card3D>
            <GlassCard className="p-8">
              <h3 className="text-xl text-foreground mb-6">Payment Method</h3>
              
              <div className="flex items-center gap-4">
                <motion.div
                  className={`bg-gradient-to-br ${selectedMethod?.gradient} w-14 h-14 rounded-xl flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {selectedMethod?.icon && <selectedMethod.icon className="h-7 w-7 text-white" />}
                </motion.div>
                <div>
                  <h4 className="text-lg text-foreground">{selectedMethod?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {['telebirr', 'cbebirr', 'amole', 'hellocash'].includes(paymentMethod) && phoneNumber}
                    {paymentMethod === 'bank' && accountNumber}
                    {['visa', 'mastercard'].includes(paymentMethod) && `**** **** **** ${cardNumber.slice(-4)}`}
                    {paymentMethod === 'paypal' && email}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Card3D>
        </ScrollReveal>

        {/* Security Notice */}
        <ScrollReveal delay={0.3}>
          <GlassCard className="p-6 bg-green-500/10 border-green-500/20">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-foreground mb-1">Secure Payment</h4>
                <p className="text-sm text-muted-foreground">
                  Your payment is secured with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* Action Buttons */}
        <ScrollReveal delay={0.4}>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep('details')}
            >
              Back to Details
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      <Lock className="h-5 w-5" />
                    </motion.div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Confirm & Pay {formatCurrency(order.amount)}
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="min-h-[600px] flex items-center justify-center">
      <ScrollReveal>
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                className="bg-gradient-to-br from-green-500 to-emerald-600 w-24 h-24 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.h2
            className="text-4xl text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Payment Successful!
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your payment of {formatCurrency(order.amount)} has been processed successfully.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card3D>
              <GlassCard className="p-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="text-foreground">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="text-foreground">{formatCurrency(order.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="text-foreground">{paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </GlassCard>
            </Card3D>
          </motion.div>

          {onClose && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={onClose}
                size="lg"
                className="bg-gradient-to-r from-primary to-orange-600"
              >
                Close
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-12">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        {step !== 'success' && (
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">Secure Payment</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-6xl mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Complete Your Payment
              </h1>
              <p className="text-xl text-muted-foreground">
                Choose your payment method and complete the transaction
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Order Summary Sidebar (Sticky on Desktop) */}
        {step !== 'success' && (
          <ScrollReveal delay={0.1}>
            <Card3D className="mb-8">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-3xl text-primary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatCurrency(order.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                    <p className="text-foreground">{order.orderId}</p>
                  </div>
                </div>
              </GlassCard>
            </Card3D>
          </ScrollReveal>
        )}

        {/* Main Content */}
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
  );
}
