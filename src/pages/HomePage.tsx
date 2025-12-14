import { Link } from 'react-router-dom';
import { Package, Truck, Clock, Shield, ArrowRight, Zap, MapPin, Lock, Star, ChevronRight, CreditCard } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { SEO } from '../components/global/SEO';
import { Card3D } from '../components/global/Card3D';
import { GlassCard } from '../components/global/GlassCard';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { ParallaxSection } from '../components/global/ParallaxSection';
import { FloatingElement } from '../components/global/FloatingElement';
import { PaymentModal } from '../components/global/PaymentModal';
import { toast } from 'sonner@2.0.3';

export function HomePage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const features = [
    {
      icon: Zap,
      title: 'የፈጣን አገልግሎት',
      description: 'በአዲስ አበባ ውስጥ በተመሳሳይ ቀን እና በሀገር ውስጥ በቀጣይ ቀን መላኪያ አገልግሎት።',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: 'ደህንነቱ የተጠበቀ',
      description: 'ሁሉም ጥቅሎችዎ በኢንሹራንስ የተጠበቁ እና ደህንነቱ የተረጋገጠ ናቸው።',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MapPin,
      title: 'በመላው ኢትዮጵያ',
      description: 'ከአዲስ አበባ እስከ ሀገሪቱ ማንኛውም ክፍል ድረስ ፈጣን አገልግሎት።',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Lock,
      title: 'የመከታተያ አገልግሎት',
      description: 'የእውነተኛ ጊዜ GPS መከታተያ ከጀመሩ እስከ መድረሻ ድረስ።',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'የቀን የመላኪያ አገልግሎቶች', icon: Package },
    { value: '50+', label: 'የገና ክፍሎች', icon: MapPin },
    { value: '98%', label: 'የጠበቀ ጊዜ የመላኪያ አገልግሎቶች', icon: Clock },
    { value: '24/7', label: 'የጠየቁ አገልግሎት', icon: Shield },
  ];

  const services = [
    {
      title: 'የፈጣን መላኪያ አገልግሎት',
      description: 'በሰዓት እና ቀን የመላኪያ አገልግሎት',
      icon: Zap,
      image: 'https://cdn.dribbble.com/userupload/45768593/file/251a9cf4930cf87ea898136f8192fcc6.png?resize=752x&vertical=center',
    },
    {
      title: 'የመላው ኢትዮጵያ አገልግሎት',
      description: 'በመላው ኢትዮጵያ የመላኪያ አገልግሎት',
      icon: MapPin,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjB3YXJlaG91c2V8ZW58MXx8fHwxNzY0MTg0NTc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      title: 'የመከታተያ አገልግሎት',
      description: 'የመከታተያ አገልግሎት የመላኪያ አገልግሎት የመጀመሪያ እስከ የመድረሻ ድረስ',
      icon: Lock,
      image: 'https://www.locate2u.com/wp-content/uploads/real-time-tracking-software-essential-features.jpg',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'E-commerce Owner',
      content: 'ሀሴት has transformed our delivery operations. Fast, reliable, and professional!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Logistics Manager',
      content: 'Best delivery service we\'ve used. The tracking system is incredibly accurate.',
      rating: 5,
    },
    {
      name: 'Emma Davis',
      role: 'Small Business Owner',
      content: 'Affordable rates without compromising on quality. Highly recommend!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <SEO
        title="ሀሴት Delivery - Fast & Reliable Delivery Services"
        description="Professional delivery services with same-day, next-day, and international shipping. Track packages in real-time with ሀሴት Delivery."
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-500/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">Fast & Reliable Shipping</span>
                </motion.div>

                <h1 className="text-5xl lg:text-7xl mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Delivery at the
                  <span className="block bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                    Speed of Trust
                  </span>
                </h1>

                <p className="text-xl mb-8 text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Experience next-generation logistics with real-time tracking,
                  AI-powered routing, and guaranteed delivery times.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/pricing">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 group">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/track-order">
                    <Button size="lg" variant="outline" className="group">
                      Track Order
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Column - 3D Floating Card */}
            <div className="relative lg:block hidden">
              <FloatingElement duration={4}>
                <Card3D className="perspective-1000">
                  <GlassCard className="p-8">
                    <div className="relative h-[400px] rounded-xl overflow-hidden">
                      <img
                        src="https://www.afro.who.int/sites/default/files/inline-images/IMG_7914.JPG"
                        alt="Delivery Truck"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-white">Live Tracking Active</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white/80 text-sm">Estimated Arrival</span>
                            <span className="text-white">2:30 PM</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <motion.div
                              className="bg-primary h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '75%' }}
                              transition={{ duration: 2, delay: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Card3D>
              </FloatingElement>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Glassmorphism */}
      <section className="relative py-20 -mt-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <GlassCard className="p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-4xl text-foreground mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section - 3D Cards Grid */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                className="inline-block bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm text-primary">Why Choose Us</span>
              </motion.div>
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Built for Modern Logistics
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Cutting-edge technology meets exceptional service
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1} direction="up">
                <Card3D glowColor={feature.gradient.includes('orange') ? '#FF6600' : '#6366f1'}>
                  <motion.div
                    className="relative h-full bg-card border border-border rounded-2xl p-6 overflow-hidden group"
                    whileHover={{ y: -5 }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    <div className="relative z-10">
                      <motion.div
                        className={`bg-gradient-to-br ${feature.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <h3 className="text-xl mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm group-hover:text-foreground/80 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Our Services
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Comprehensive delivery solutions for every need
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <ParallaxSection offset={30}>
                  <motion.div
                    className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <motion.div
                        className="bg-primary/90 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <service.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <h3 className="text-2xl text-white mb-2">
                        {service.title}
                      </h3>
                      <p className="text-white/80 mb-4">
                        {service.description}
                      </p>
                      <Link to="/services">
                        <Button
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm w-fit group"
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </ParallaxSection>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                See what our customers have to say
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <Card3D>
                  <GlassCard className="p-6 h-full">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="border-t border-border pt-4">
                      <div className="text-sm text-foreground">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </GlassCard>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Payment Demo Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Easy & Secure Payments
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Multiple payment options including Ethiopian Birr (ETB) and international methods
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { name: 'Telebirr', gradient: 'from-orange-500 to-red-500' },
              { name: 'CBE Birr', gradient: 'from-green-500 to-emerald-600' },
              { name: 'Visa/MC', gradient: 'from-blue-600 to-blue-700' },
              { name: 'PayPal', gradient: 'from-blue-500 to-indigo-600' },
            ].map((method, index) => (
              <ScrollReveal key={index} delay={index * 0.05}>
                <Card3D>
                  <GlassCard className="p-6 text-center">
                    <motion.div
                      className={`bg-gradient-to-br ${method.gradient} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <CreditCard className="h-6 w-6 text-white" />
                    </motion.div>
                    <p className="text-foreground">{method.name}</p>
                  </GlassCard>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setPaymentModalOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 shadow-lg shadow-primary/25"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Try Payment Demo
                </Button>
              </motion.div>
              <p className="text-sm text-muted-foreground mt-3">
                Experience our seamless checkout process
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-600" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-6"
            >
              <Package className="h-16 w-16 text-white mx-auto" />
            </motion.div>
            <h2 className="text-4xl lg:text-5xl text-white mb-6">
              Ready to Ship Smarter?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust ሀሴት for their delivery needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        orderDetails={{
          orderId: 'DEMO' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          amount: 2500,
          items: ['Express Delivery Demo', 'Insurance Coverage', 'Priority Handling']
        }}
        onSuccess={() => {
          setPaymentModalOpen(false);
          toast.success('Demo payment completed! This is how easy it is to pay with ሀሴት.');
        }}
      />
    </div>
  );
}