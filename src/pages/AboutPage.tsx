import { Users, Target, Award, TrendingUp, Heart, Globe, Rocket, Zap, Calendar, MapPin, Users as TeamIcon, Lightbulb, Star, ChevronDown, Sparkles, ArrowRight, Play, Pause, Eye, Code, Shield, Video, Palette } from 'lucide-react';
import { SEO } from '../components/global/SEO';
import { Card3D } from '../components/global/Card3D';
import { GlassCard } from '../components/global/GlassCard';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { ParallaxSection } from '../components/global/ParallaxSection';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

// New Particle Background Component
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas || !isMountedRef.current) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      update: () => void;
      draw: () => void;
    }> = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(59, 130, 246, ${Math.random() * 0.3})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx || !isMountedRef.current) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!isMountedRef.current || !canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
    />
  );
};

// New Floating Elements Component
const FloatingElements = () => {
  // Generate positions once using useState to avoid re-renders
  const [positions] = useState(() => 
    Array.from({ length: 15 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: pos.duration,
            repeat: Infinity,
            delay: pos.delay,
          }}
        />
      ))}
    </div>
  );
};

// New Interactive Service Cards
interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  index: number;
}

const ServiceCard = ({ icon: Icon, title, description, gradient, index }: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card3D>
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 h-full"
          whileHover={{ y: -10, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Animated Background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10`}
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={{ duration: 1 }}
          />

          {/* Floating Icon */}
          <motion.div
            className={`bg-gradient-to-br ${gradient} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative`}
            animate={{
              y: isHovered ? [-5, 5] : 0,
              rotate: isHovered ? [0, 5] : 0
            }}
            transition={{ 
              duration: 2, 
              repeat: isHovered ? Infinity : 0,
              repeatType: "reverse",
              type: "tween"
            }}
          >
            <Icon className="h-10 w-10 text-white" />
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-white/30"
              animate={{ scale: isHovered ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
            />
          </motion.div>

          {/* Content */}
          <h3 className="text-2xl text-foreground mb-4 font-bold">
            {title}
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>

          {/* Animated Arrow */}
          <motion.div
            className="flex items-center gap-2 text-primary font-semibold"
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>Learn More</span>
            <motion.div
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </motion.div>

          {/* Particle Effect on Hover */}
          {isHovered && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 3],
                    opacity: [1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 100,
                    y: Math.sin((i / 8) * Math.PI * 2) * 100,
                  }}
                  transition={{ duration: 0.8 }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </Card3D>
    </motion.div>
  );
};

// New Interactive Stats Counter
const AnimatedCounter = ({ value, duration = 2 }: { value: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace('+', ''));

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const increment = end / (duration * 60); // 60 FPS

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [numericValue, duration]);

  return (
    <span>
      {count}+
    </span>
  );
};

// Enhanced Timeline Item Component - moved outside to prevent re-creation
interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  milestone: string;
  color: string;
  achievements: string[];
}

interface EnhancedTimelineItemProps {
  item: TimelineItem;
  index: number;
  progress: any;
  progressValues: any[];
  timelineLength: number;
}

const EnhancedTimelineItem = ({ item, index, progress, progressValues, timelineLength }: EnhancedTimelineItemProps) => {
    const isEven = index % 2 === 0;
    const [isHovered, setIsHovered] = useState(false);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      rotateX.set(-y * 10);
      rotateY.set(x * 10);
    };

    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
      setIsHovered(false);
    };

  // Use whileInView instead of scroll progress for more reliable rendering
    return (
      <motion.div
        className={`relative flex flex-col lg:flex-row items-start lg:items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
          }`}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        {/* Timeline Content */}
        <div className={`lg:w-1/2 ${isEven ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'} w-full mb-4 lg:mb-0`}>
          <motion.div
            className="relative group cursor-pointer"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={{
              rotateX: useSpring(rotateX, { stiffness: 300, damping: 30 }),
              rotateY: useSpring(rotateY, { stiffness: 300, damping: 30 }),
            }}
          >
            {/* Glow Effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20`}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            />

            <Card3D>
              <motion.div
                className="relative overflow-hidden rounded-2xl bg-card border border-border p-8"
                whileHover={{ y: -15, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Animated Background Pattern */}
                <motion.div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }}
                  animate={{
                    x: isHovered ? [0, 20, 0] : 0,
                    y: isHovered ? [0, 20, 0] : 0
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />

                {/* Milestone Header - Text appears early */}
                <div className="flex items-center justify-between mb-6">
                  <motion.div
                    className={`bg-gradient-to-br ${item.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {item.milestone}
                  </motion.div>
                  <motion.div
                    className="text-3xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {item.year}
                  </motion.div>
                </div>

                {/* Animated Icon Container */}
                <motion.div
                  className={`relative bg-gradient-to-br ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl`}
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                >
                  <item.icon className="h-8 w-8 text-white" />

                  {/* Icon Glow */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl blur-md`}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Content - Text appears clearly before animations */}
                <motion.h3
                  className="text-2xl lg:text-3xl text-foreground mb-4 font-bold text-center leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {item.title}
                </motion.h3>

                <motion.p
                  className="text-muted-foreground mb-6 leading-relaxed text-center"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {item.description}
                </motion.p>

                {/* Enhanced Achievements */}
                <div className="space-y-3">
                  {item.achievements.map((achievement, achievementIndex) => (
                    <motion.div
                      key={achievementIndex}
                      className="flex items-center gap-3 text-sm text-muted-foreground group/achievement"
                      initial={{ opacity: 0, x: isEven ? -30 + (achievementIndex * 10) : 30 - (achievementIndex * 10) }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (achievementIndex * 0.15) }}
                    >
                      <motion.div
                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} relative`}
                        animate={{
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: achievementIndex * 0.3,
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-current"
                          animate={{ scale: [1, 2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                      <motion.span
                        className="group-hover/achievement:text-foreground transition-colors duration-300"
                        whileHover={{ x: 5 }}
                      >
                        {achievement}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>

                {/* Interactive Sparkles */}
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-yellow-400"
                        style={{
                          left: `${20 + (i * 15)}%`,
                          top: `${10 + (i * 5)}%`,
                        }}
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          rotate: [0, 180],
                          y: [0, -20, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.2,
                        }}
                      >
                        <Sparkles className="h-3 w-3" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </Card3D>
          </motion.div>
        </div>

        {/* Enhanced Timeline Dot */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-background shadow-2xl hidden lg:flex items-center justify-center z-20 group bg-primary"
          initial={{ scale: 0, background: '#e5e7eb' }}
          whileInView={{ scale: 1, background: '#3b82f6' }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.5 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-3 h-3 rounded-full bg-white shadow-inner"
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-current opacity-0"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Enhanced Timeline Line Segment */}
      {index < timelineLength - 1 && (
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 h-32 bg-gradient-to-b from-primary via-purple-500 to-cyan-500 w-1 hidden lg:block z-10 rounded-full"
            style={{
              top: '100%',
            }}
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          />
        )}
      </motion.div>
    );
  };

export function AboutPage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Cleanup effect to ensure animations stop when component unmounts
  useEffect(() => {
    setIsMounted(true);
    // Scroll to top when component mounts (use setTimeout to avoid blocking)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
    
    return () => {
      setIsMounted(false);
      // DON'T scroll on unmount - this interferes with React Router navigation
      // The router will handle scrolling to top if needed
    };
  }, []);

  // Define timeline data first so it's available for components
  const timeline = [
    {
      year: '2024',
      title: 'The Beginning: INSA Summer Camp',
      description: '20 passionate young innovators gathered at the INSA Summer Camp, united by a shared vision to revolutionize Ethiopian technology and logistics.',
      icon: TeamIcon,
      milestone: 'Foundation',
      color: 'from-blue-500 to-cyan-500',
      achievements: ['Team of 20 innovators formed', 'Shared vision established', 'Initial concept development']
    },
    {
      year: '2024',
      title: 'Vision & Mission Defined',
      description: 'We established our core philosophy: "Why join the system when you can build it?" - committing to innovation, impact, and Ethiopian technological sovereignty.',
      icon: Lightbulb,
      milestone: 'Ideation',
      color: 'from-purple-500 to-pink-500',
      achievements: ['Core motto defined', 'Company values established', 'Strategic roadmap created']
    },
    {
      year: '2024',
      title: 'Service Portfolio Launch',
      description: 'Officially launched our comprehensive service offerings including Cybersecurity, Full-Stack Development, Graphics Design, and Video Editing services.',
      icon: Rocket,
      milestone: 'Launch',
      color: 'from-orange-500 to-red-500',
      achievements: ['4 core services launched', 'Technical infrastructure built', 'Service protocols established']
    },
    {
      year: '2025',
      title: 'First Major Success',
      description: 'Successfully delivered our first portfolio of client projects, validating our business model and establishing our reputation for excellence and reliability.',
      icon: Star,
      milestone: 'Breakthrough',
      color: 'from-green-500 to-emerald-500',
      achievements: ['First client projects delivered', 'Proven track record established', 'Customer trust built']
    },
    {
      year: 'Future',
      title: 'Ethiopian Tech Leadership',
      description: 'Our ambitious vision to become Ethiopia\'s leading technology company with global impact, driving innovation and digital transformation across Africa.',
      icon: Target,
      milestone: 'Vision 2030',
      color: 'from-indigo-500 to-purple-500',
      achievements: ['Market leadership position', 'Global expansion', 'Industry innovation']
    },
  ];

  // Use scroll tracking with container ref
  // Hooks must be called unconditionally, so we always call useScroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
    layoutEffect: false
  });

  // Enhanced progress-based animations with better timing for text visibility
  // These will work even if scroll tracking isn't ready yet
  const progress1 = useSpring(useTransform(scrollYProgress, [0, 0.15], [0, 1]), {
    stiffness: 100,
    damping: 30
  });
  const progress2 = useSpring(useTransform(scrollYProgress, [0.15, 0.3], [0, 1]), {
    stiffness: 100,
    damping: 30
  });
  const progress3 = useSpring(useTransform(scrollYProgress, [0.3, 0.45], [0, 1]), {
    stiffness: 100,
    damping: 30
  });
  const progress4 = useSpring(useTransform(scrollYProgress, [0.45, 0.6], [0, 1]), {
    stiffness: 100,
    damping: 30
  });
  const progress5 = useSpring(useTransform(scrollYProgress, [0.6, 0.75], [0, 1]), {
    stiffness: 100,
    damping: 30
  });

  const progressValues = [progress1, progress2, progress3, progress4, progress5];

  const stats = [
    { value: '1+', label: 'Years Experience', icon: Award },
    { value: '5+', label: 'Happy Customers', icon: Users },
    { value: '10+', label: 'Deliveries Made', icon: Rocket },
    { value: '50+', label: 'Countries Served', icon: Globe },
  ];

  const values = [
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'We leverage cutting-edge technology and optimized logistics to ensure your packages arrive faster than ever.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Every decision we make is guided by what\'s best for our customers. Your satisfaction is our success.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Target,
      title: 'Reliability',
      description: 'Consistency and dependability are at the core of everything we do. We deliver on our promises, every time.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We continuously evolve our services with the latest technology to stay ahead in the logistics industry.',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const services = [
    {
      icon: Shield,
      title: 'Cybersecurity',
      description: 'Advanced security solutions to protect your digital assets and ensure data integrity across all platforms.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Code,
      title: 'Full-Stack Development',
      description: 'End-to-end web and mobile application development using cutting-edge technologies and best practices.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Palette,
      title: 'Graphics Design',
      description: 'Creative visual solutions that capture your brand essence and communicate your message effectively.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Video,
      title: 'Video Editing',
      description: 'Professional video production and editing services that tell compelling stories and engage audiences.',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen relative">
      <SEO
        title="About Us - ሀሴት Delivery"
        description="Learn about ሀሴት Delivery's mission to provide fast, reliable, and innovative delivery services. Discover our story, values, and commitment to excellence."
      />

      {/* Global Background Elements */}
      <ParticleBackground />
      <FloatingElements />

      {/* Hero Section with Enhanced Effects */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Animated Grid */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-full bg-primary/5"
              style={{ left: `${(i * 5)}%` }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 backdrop-blur-sm border border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
              >
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">About ሀሴት Delivery</span>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-foreground via-primary to-foreground/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Building Ethiopia's<br />
                <motion.span
                  className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  Digital Future
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                From a summer camp idea to a pioneering tech company - we're on a mission to
                transform Ethiopia's technological landscape through innovation and excellence.
              </motion.p>

              <motion.p
                className="text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Founded by passionate young innovators, we've grown from a visionary team to
                a full-service technology company delivering cutting-edge solutions across
                cybersecurity, development, and digital services.
              </motion.p>

              {/* Enhanced Scroll indicator */}
              <motion.div
                className="flex items-center gap-3 text-sm text-muted-foreground mt-12 cursor-pointer group"
                animate={{ y: [0, 10] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", type: "tween" }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.span
                  animate={{ opacity: [0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", type: "tween" }}
                >
                  Scroll to explore our journey
                </motion.span>
                <motion.div
                  animate={{ y: [0, 5] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", type: "tween" }}
                >
                  <ChevronDown className="h-4 w-4 group-hover:text-primary transition-colors" />
                </motion.div>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <ParallaxSection offset={60}>
                <Card3D>
                  <motion.div
                    className="relative rounded-2xl overflow-hidden group"
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <img
                      src="/ourlogo.jpg"
                      alt="Team Meeting"
                      className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Floating Elements Over Image */}
                    <motion.div
                      className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                      animate={{ y: [0, -10] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", type: "tween" }}
                    >
                      <Rocket className="h-6 w-6 text-white" />
                    </motion.div>

                    <motion.div
                      className="absolute bottom-20 left-6 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                      animate={{ y: [0, 10] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1, type: "tween" }}
                    >
                      <Target className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>
                </Card3D>
              </ParallaxSection>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card3D key={index}>
                  <GlassCard className="p-8 text-center h-full group hover:bg-primary/5 transition-all duration-500 backdrop-blur-sm">
                    <motion.div
                      className="bg-gradient-to-br from-primary to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      whileHover={{ rotate: 360, scale: 1.15 }}
                      animate={{ y: [0, -10] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: index * 0.5,
                        type: "tween"
                      }}
                    >
                      <stat.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-4xl lg:text-5xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300 font-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 font-medium">
                      {stat.label}
                    </div>

                    {/* Hover Effect Line */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-primary to-orange-600 rounded-full"
                      whileHover={{ width: '80%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </GlassCard>
                </Card3D>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* New Services Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 backdrop-blur-sm border border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Code className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Our Services</span>
              </motion.div>
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Comprehensive Digital<br />Solutions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                We offer a complete suite of technology services to power your digital transformation
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                {...service}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Timeline Section with Better Text Visibility */}
      <section ref={timelineRef} className="py-20 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 backdrop-blur-sm border border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Our Journey</span>
              </motion.div>
              <motion.h2
                className="text-4xl lg:text-5xl text-foreground mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                From Vision to Reality
              </motion.h2>
              <motion.p
                className="text-muted-foreground max-w-2xl mx-auto text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                The remarkable journey of young innovators building Ethiopia's next tech powerhouse
              </motion.p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Enhanced Animated Timeline Line with better timing */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-gradient-to-b from-primary via-purple-500 to-cyan-500 hidden lg:block rounded-full shadow-2xl"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                transformOrigin: 'top',
              }}
            >
              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
              />
            </motion.div>

            <div className="space-y-8 lg:space-y-16">
              {timeline.map((item, index) => (
                <EnhancedTimelineItem
                  key={index}
                  item={item}
                  index={index}
                  progress={progressValues[index]}
                  progressValues={progressValues}
                  timelineLength={timeline.length}
                />
              ))}
            </div>

            {/* Enhanced Future Arrow */}
            <motion.div
              className="text-center mt-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <motion.div
                className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-2xl cursor-pointer group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(139, 92, 246, 0.7)',
                    '0 0 0 20px rgba(139, 92, 246, 0)',
                    '0 0 0 0 rgba(139, 92, 246, 0)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Target className="h-6 w-6" />
                <span className="font-bold text-lg">The Journey Continues...</span>
                <motion.div
                  animate={{ x: [0, 8] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", type: "tween" }}
                  className="group-hover:translate-x-2 transition-transform duration-300"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
                Our Core Values
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                The principles that guide everything we do
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <Card3D>
                  <motion.div
                    className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 h-full group"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    <div className="relative z-10">
                      <motion.div
                        className={`bg-gradient-to-br ${value.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                      >
                        <value.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl text-foreground mb-4 font-bold">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ParallaxSection offset={40}>
                <Card3D>
                  <motion.div
                    className="relative rounded-2xl overflow-hidden group"
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1462826303086-329426d1aef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYxNjU5NjY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Our Workspace"
                      className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Floating Team Badge */}
                    <motion.div
                      className="absolute top-6 left-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                      animate={{ y: [0, -10] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", type: "tween" }}
                    >
                      <div className="text-white font-bold text-lg">20+</div>
                      <div className="text-white/80 text-sm">Innovators</div>
                    </motion.div>
                  </motion.div>
                </Card3D>
              </ParallaxSection>

              <div>
                <h2 className="text-4xl lg:text-5xl text-foreground mb-6">
                  Built by Visionary Minds
                </h2>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Our team of 20+ young Ethiopian innovators brings fresh perspectives and
                  cutting-edge expertise to every project, driven by passion and a commitment
                  to excellence.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We believe in the power of Ethiopian talent and are dedicated to building
                  solutions that not only meet global standards but also address local challenges.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className="bg-primary/10 border border-primary/20 rounded-xl p-4 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                  >
                    <div className="text-3xl text-primary mb-1 font-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <AnimatedCounter value="20+" duration={3} />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Young Innovators</div>
                  </motion.div>
                  <motion.div
                    className="bg-primary/10 border border-primary/20 rounded-xl p-4 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                  >
                    <div className="text-3xl text-primary mb-1 font-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <AnimatedCounter value="4+" duration={3} />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Core Services</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}