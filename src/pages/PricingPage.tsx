import { useState, useEffect } from 'react';
import { Check, Calculator, Zap, TrendingUp, Sparkles, CreditCard, Mail, MessageCircle, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SEO } from '../components/global/SEO';
import { Card3D } from '../components/global/Card3D';
import { GlassCard } from '../components/global/GlassCard';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { PaymentModal } from '../components/global/PaymentModal';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import logoImage from 'figma:asset/027612d655664ce5469a768edc12392eca0af979.png';
import { pricingService, PricingConfiguration, SubscriptionPlan, ServiceOffering } from '../services/pricing';

const iconMap: { [key: string]: any } = {
  Zap, TrendingUp, Crown, Check, Calculator, Sparkles, CreditCard, Mail, MessageCircle
};

const getIcon = (name: string) => iconMap[name] || Zap;

const convertGradientToCSS = (tailwindGradient: string): string => {
  // Direct mapping for known presets to ensure 100% accuracy
  const presetMap: { [key: string]: string } = {
    'from-blue-600 to-cyan-600': 'linear-gradient(to bottom right, #2563eb, #0891b2)', // Ocean Blue
    'from-purple-600 to-pink-600': 'linear-gradient(to bottom right, #9333ea, #db2777)', // Purple Dream
    'from-orange-600 to-red-600': 'linear-gradient(to bottom right, #ea580c, #dc2626)', // Sunset Orange
    'from-green-600 to-teal-600': 'linear-gradient(to bottom right, #16a34a, #0d9488)', // Forest Green
    'from-indigo-600 to-purple-600': 'linear-gradient(to bottom right, #4f46e5, #9333ea)', // Royal Purple
    'from-yellow-600 to-orange-600': 'linear-gradient(to bottom right, #ca8a04, #ea580c)', // Golden Yellow
    'from-pink-600 to-rose-600': 'linear-gradient(to bottom right, #db2777, #e11d48)', // Rose Pink
    'from-cyan-600 to-blue-600': 'linear-gradient(to bottom right, #0891b2, #2563eb)', // Sky Blue
    'from-purple-600 via-pink-500 to-rose-500': 'linear-gradient(to bottom right, #9333ea, #ec4899, #f43f5e)' // Luxury Purple-Pink
  };

  if (presetMap[tailwindGradient]) {
    return presetMap[tailwindGradient];
  }

  const colorMap: { [key: string]: string } = {
    'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8',
    'cyan-500': '#06b6d4', 'cyan-600': '#0891b2', 'cyan-700': '#0e7490',
    'purple-500': '#a855f7', 'purple-600': '#9333ea', 'purple-700': '#7e22ce',
    'pink-500': '#ec4899', 'pink-600': '#db2777', 'pink-700': '#be185d',
    'orange-500': '#f97316', 'orange-600': '#ea580c', 'orange-700': '#c2410c',
    'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
    'green-500': '#22c55e', 'green-600': '#16a34a', 'green-700': '#15803d',
    'teal-500': '#14b8a6', 'teal-600': '#0d9488', 'teal-700': '#0f766e',
    'indigo-500': '#6366f1', 'indigo-600': '#4f46e5', 'indigo-700': '#4338ca',
    'yellow-500': '#eab308', 'yellow-600': '#ca8a04', 'yellow-700': '#a16207',
    'rose-500': '#f43f5e', 'rose-600': '#e11d48', 'rose-700': '#be123c'
  };

  const parts = tailwindGradient.split(' ');
  const colors: string[] = [];

  parts.forEach(part => {
    Object.keys(colorMap).forEach(colorKey => {
      if (part.includes(colorKey)) {
        colors.push(colorMap[colorKey]);
      }
    });
  });

  if (colors.length >= 2) {
    return `linear-gradient(to bottom right, ${colors.join(', ')})`;
  }
  return `linear-gradient(to bottom right, #2563eb, #0891b2)`;
};

export function PricingPage() {
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState({ weight: '', distance: '', service: '' });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfiguration | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [serviceOfferings, setServiceOfferings] = useState<ServiceOffering[]>([]);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, plans, services] = await Promise.all([
          pricingService.getConfig(),
          pricingService.getPlans(),
          pricingService.getServices()
        ]);
        if (config.length > 0) setPricingConfig(config[0]);
        setSubscriptionPlans(plans);
        setServiceOfferings(services);
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
        toast.error('Failed to load pricing data');
      }
    };
    fetchData();
  }, []);

  const calculatePrice = async () => {
    setShowError(false);
    setErrors({ weight: '', distance: '', service: '' });

    let hasError = false;
    const newErrors = { weight: '', distance: '', service: '' };

    if (!weight || weight.trim() === '') {
      newErrors.weight = 'Weight is required';
      hasError = true;
    }

    if (!distance || distance.trim() === '') {
      newErrors.distance = 'Distance is required';
      hasError = true;
    }

    if (!serviceType) {
      newErrors.service = 'Service type is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setShowError(true);
      toast.error('Please fill in all fields to calculate price');
      return;
    }

    const weightValue = parseFloat(weight);
    const distanceValue = parseFloat(distance);

    if (isNaN(weightValue) || weightValue <= 0) {
      setErrors({ ...newErrors, weight: 'Please enter a valid weight greater than 0' });
      toast.error('Please enter a valid weight greater than 0');
      return;
    }

    if (isNaN(distanceValue) || distanceValue <= 0) {
      setErrors({ ...newErrors, distance: 'Please enter a valid distance greater than 0' });
      toast.error('Please enter a valid distance greater than 0');
      return;
    }

    try {
      const result = await pricingService.calculatePrice(weightValue, distanceValue, parseInt(serviceType));
      setCalculatedPrice(result.total);
      setCalculationResult(result);
      toast.success('Price calculated successfully!');
    } catch (error) {
      console.error('Calculation failed:', error);
      toast.error('Failed to calculate price');
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    toast.success(`Successfully subscribed to ${selectedPlan?.name} plan!`);
    // Optionally redirect to dashboard or confirmation page
    // navigate('/dashboard');
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Pricing - ሀሴት Delivery"
        description="Transparent pricing for all your delivery needs. Calculate shipping costs and choose the perfect plan for your business."
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">Simple & Transparent</span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Pricing That Makes Sense
              </h1>

              <p className="text-xl text-muted-foreground">
                No hidden fees, no surprises. Choose a plan that fits your shipping needs and budget.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="py-20 bg-background -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-8 lg:p-12 shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <motion.div
                      className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Calculator className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-3xl text-white mb-2">
                      Calculate Shipping Cost
                    </h2>
                    <p className="text-white/80">
                      Get an instant estimate for your delivery
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 relative z-20">
                    <div className="relative z-10">
                      <Label className="text-white mb-2 block">Weight (kg)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g., 5"
                        value={weight}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string, numbers, and decimal point
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setWeight(value);
                            if (errors.weight) {
                              setErrors({ ...errors, weight: '' });
                            }
                          }
                        }}
                        className={`bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 rounded-xl relative z-10 ${errors.weight ? 'border-red-400 border-2' : ''
                          }`}
                        style={{ pointerEvents: 'auto' }}
                      />
                      {errors.weight && (
                        <p className="text-red-300 text-xs mt-1">{errors.weight}</p>
                      )}
                    </div>

                    <div className="relative z-10">
                      <Label className="text-white mb-2 block">Distance (km)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g., 100"
                        value={distance}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string, numbers, and decimal point
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setDistance(value);
                            if (errors.distance) {
                              setErrors({ ...errors, distance: '' });
                            }
                          }
                        }}
                        className={`bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 rounded-xl relative z-10 ${errors.distance ? 'border-red-400 border-2' : ''
                          }`}
                        style={{ pointerEvents: 'auto' }}
                      />
                      {errors.distance && (
                        <p className="text-red-300 text-xs mt-1">{errors.distance}</p>
                      )}
                    </div>

                    <div className="relative z-30">
                      <Label className="text-white mb-2 block">Service Type</Label>
                      <Select
                        value={serviceType}
                        onValueChange={(value) => {
                          setServiceType(value);
                          if (errors.service) {
                            setErrors({ ...errors, service: '' });
                          }
                        }}
                      >
                        <SelectTrigger
                          className={`bg-white/20 backdrop-blur-sm border-white/30 text-white h-12 rounded-xl relative z-30 ${errors.service ? 'border-red-400 border-2' : ''
                            }`}
                          style={{ pointerEvents: 'auto' }}
                        >
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl relative z-50 bg-white">
                          {serviceOfferings.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.title} ({service.multiplier > 0 ? `+${service.multiplier * 100}%` : '0%'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.service && (
                        <p className="text-red-300 text-xs mt-1">{errors.service}</p>
                      )}
                    </div>
                  </div>

                  {showError && (
                    <motion.div
                      className="mb-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-3 text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-white text-sm">Please fill in all required fields to calculate the price</p>
                    </motion.div>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={calculatePrice}
                      className="w-full bg-white text-primary hover:bg-white/90 h-14 rounded-xl text-lg"
                      size="lg"
                    >
                      Calculate Price
                    </Button>
                  </motion.div>

                  {calculatedPrice !== null && (
                    <>
                      <motion.div
                        className="mt-6 bg-white/20 backdrop-blur-md rounded-xl p-6 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-white/80 text-sm mb-2">Estimated Cost</p>
                        <p className="text-5xl text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {calculatedPrice} ETB
                        </p>
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-white/70 text-xs mb-2">
                            Base: ({parseFloat(weight)} kg × {pricingConfig?.additionalWeightFeePerKg || 5} ETB) + ({parseFloat(distance)} km × {pricingConfig?.distanceRatePerKm || 3} ETB) + Base Fee ({pricingConfig?.baseFee || 0} ETB)
                          </p>
                          {calculationResult?.serviceFee > 0 && (
                            <p className="text-white/70 text-xs">
                              + {calculationResult.serviceName} fee = {calculationResult.serviceFee.toFixed(2)} ETB
                            </p>
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <p className="text-white/60 text-xs mb-1">Example Calculation:</p>
                        <p className="text-white/90 text-sm">
                          10kg + 5km (Express) = 10×5 + 5×3 = 65 + 20% = 78 ETB
                        </p>
                      </motion.div>
                    </>
                  )}

                  {/* Pricing Info */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                      <p className="text-white/70 text-xs mb-1">Per Kilogram</p>
                      <p className="text-white text-lg">{pricingConfig?.additionalWeightFeePerKg || 5} ETB/kg</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                      <p className="text-white/70 text-xs mb-1">Per Kilometer</p>
                      <p className="text-white text-lg">{pricingConfig?.distanceRatePerKm || 3} ETB/km</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                      <p className="text-white/70 text-xs mb-1">Service Fees</p>
                      <p className="text-white text-xs">
                        {serviceOfferings.map(s => (
                          <span key={s.id} className="block">{s.title}: {s.multiplier > 0 ? `+${s.multiplier * 100}%` : '0%'}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Choose Your Plan
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Flexible pricing options for individuals and businesses of all sizes
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => {
              const IconComponent = getIcon(plan.icon);
              return (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <Card3D>
                    <motion.div
                      className={`relative h-full rounded-2xl overflow-hidden ${plan.popular ? 'scale-105' : ''
                        }`}
                      whileHover={{ y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {plan.badge && (
                        <div
                          className="absolute top-0 right-0 text-white px-4 py-1 rounded-bl-xl rounded-tr-2xl text-sm z-10"
                          style={{ background: convertGradientToCSS(plan.gradient) }}
                        >
                          {plan.badge}
                        </div>
                      )}

                      <div className={`bg-card border ${plan.popular ? 'border-primary shadow-2xl shadow-primary/20' : 'border-border'} rounded-2xl p-8 h-full flex flex-col`}>
                        <motion.div
                          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                          style={{ background: convertGradientToCSS(plan.gradient) }}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <IconComponent className="h-7 w-7 text-white" />
                        </motion.div>

                        <h3 className="text-2xl text-foreground mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {plan.description}
                        </p>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl text-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {plan.price}
                            </span>
                            <span className="text-muted-foreground">/{plan.period}</span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-8 flex-grow">
                          {plan.features.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-start gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: convertGradientToCSS(plan.gradient) }}
                              >
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm text-foreground/80">{feature}</span>
                            </motion.div>
                          ))}
                        </div>

                        {plan.price === 'Custom' ? (
                          <Link to="/contact" className="block">
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <Button
                                className="w-full bg-card border-2 border-border hover:border-primary text-foreground"
                                size="lg"
                              >
                                Contact Sales
                              </Button>
                            </motion.div>
                          </Link>
                        ) : (
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button
                              onClick={() => handlePlanSelect(plan)}
                              className={`w-full ${!plan.popular ? 'bg-card border-2 border-border hover:border-primary text-foreground' : 'text-white'}`}
                              style={plan.popular ? { background: convertGradientToCSS(plan.gradient) } : {}}
                              size="lg"
                            >
                              <CreditCard className="mr-2 h-5 w-5" />
                              Get Started
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </Card3D>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                All Plans Include
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Real-time GPS tracking',
              'Package insurance',
              'Proof of delivery',
              'Mobile app access',
              'Email notifications',
              'Multiple payment options',
              'Eco-friendly packaging',
              'Carbon offset program',
            ].map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.05}>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary to-orange-600 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-12 shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="relative z-10 text-center">
                  <motion.div
                    className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <MessageCircle className="h-8 w-8 text-white" />
                  </motion.div>
                  <h2 className="text-4xl text-white mb-4">
                    Still Have Questions?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Our support team is here to help you 24/7
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
                    <Link to="/contact" className="inline-block" style={{ pointerEvents: 'auto' }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-xl min-w-[200px]" style={{ pointerEvents: 'auto' }}>
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Contact Support
                        </Button>
                      </motion.div>
                    </Link>
                    <a href="mailto:hasetdelivery@gmail.com" className="inline-block" style={{ pointerEvents: 'auto' }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 h-14 px-8 rounded-xl min-w-[200px]" style={{ pointerEvents: 'auto' }}>
                          <Mail className="mr-2 h-5 w-5" />
                          Email Us
                        </Button>
                      </motion.div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        orderDetails={selectedPlan ? {
          orderId: 'PLAN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          amount: selectedPlan.amount,
          items: [
            `${selectedPlan.name} Plan Subscription`,
            ...selectedPlan.features.slice(0, 3)
          ]
        } : undefined}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}