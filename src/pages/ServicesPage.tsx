import { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Clock, Shield, Zap, Rocket, Star, Heart, Gift } from 'lucide-react';
import { SEO } from '../components/global/SEO';
import { Card3D } from '../components/global/Card3D';
import { GlassCard } from '../components/global/GlassCard';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { ParallaxSection } from '../components/global/ParallaxSection';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { pricingService, ServiceOffering } from '../services/pricing';
import { toast } from 'sonner';

// Map icon names to components
const iconMap: { [key: string]: any } = {
  Zap,
  Truck,
  MapPin,
  Package,
  Clock,
  Shield,
  Rocket,
  Star,
  Heart,
  Gift
};

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

export function ServicesPage() {
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await pricingService.getServices();
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services', error);
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const features = [
    {
      icon: Clock,
      title: 'Time-Sensitive Delivery',
      description: 'Guaranteed delivery windows with real-time updates',
    },
    {
      icon: MapPin,
      title: 'Smart Routing',
      description: 'AI-powered route optimization for faster deliveries',
    },
    {
      icon: Shield,
      title: 'Full Insurance',
      description: 'Comprehensive coverage for all your shipments',
    },
    {
      icon: Package,
      title: 'Special Handling',
      description: 'Expert care for fragile and valuable items',
    },
  ];

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Package;
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Our Services - ሀሴት Delivery"
        description="Explore our comprehensive delivery services including express, standard, international shipping, and freight services. Fast, reliable, and secure."
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
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">Complete Delivery Solutions</span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Delivery Services for Every Need
              </h1>

              <p className="text-xl text-muted-foreground mb-8">
                From express local deliveries to international freight, we provide
                comprehensive logistics solutions tailored to your requirements.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-10">Loading services...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = getIcon(service.icon);
                return (
                  <ScrollReveal key={service.id} delay={index * 0.1}>
                    <Card3D>
                      <motion.div
                        className="relative overflow-hidden rounded-2xl bg-card border border-border group h-full"
                        whileHover={{ y: -5 }}
                      >
                        {/* Image Section */}
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={service.imageUrl}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div
                            className="absolute inset-0 opacity-60"
                            style={{ background: convertGradientToCSS(service.gradient) }}
                          />

                          {/* Icon */}
                          <motion.div
                            className="absolute top-6 left-6 bg-white/20 backdrop-blur-md w-14 h-14 rounded-xl flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Icon className="h-7 w-7 text-white" />
                          </motion.div>

                          {/* Price Badge */}
                          <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                            <span className="text-white text-sm">{service.priceText}</span>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                          <h3 className="text-2xl text-foreground mb-3">
                            {service.title}
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            {service.description}
                          </p>

                          {/* Features List */}
                          <div className="space-y-3 mb-6">
                            {service.features.map((feature, idx) => (
                              <motion.div
                                key={idx}
                                className="flex items-center gap-2 group/item"
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full group-hover/item:scale-150 transition-transform"
                                  style={{ background: convertGradientToCSS(service.gradient) }}
                                />
                                <span className="text-sm text-foreground/80 group-hover/item:text-foreground transition-colors">{feature}</span>
                              </motion.div>
                            ))}
                          </div>

                          <Link to="/pricing">
                            <Button
                              className="w-full hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all"
                              style={{ background: convertGradientToCSS(service.gradient) }}
                            >
                              Get Quote
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    </Card3D>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Why Choose Our Services
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Industry-leading features that set us apart
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <ParallaxSection offset={20}>
                  <GlassCard className="p-6 h-full">
                    <motion.div
                      className="bg-gradient-to-br from-primary to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </GlassCard>
                </ParallaxSection>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-12 text-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

              <div className="relative z-10">
                <h2 className="text-4xl text-white mb-4">
                  Ready to Ship?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Get an instant quote and start shipping with confidence today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/pricing">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      Calculate Shipping Cost
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}