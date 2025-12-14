import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import logoImage from 'figma:asset/027612d655664ce5469a768edc12392eca0af979.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-secondary text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={logoImage}
                  alt="ሀሴት Delivery" 
                  className="h-14 w-14 object-contain bg-white/10 rounded-xl p-2"
                />
              </motion.div>
              <span className="text-2xl text-white group-hover:text-primary transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ሀሴት Delivery
              </span>
            </Link>
            <p className="text-white/70 mb-6 max-w-sm">
              የኢትዮጵያ ፈጣን፣ አስተማማኝ እና ደህንነቱ የተጠበቀ የመላኪያ አገልግሎቶች። የሺዎች ንግዶች አስተማማኝ አጋር።
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Stay Updated
              </h4>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button size="icon" className="bg-primary hover:bg-primary/90 flex-shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="bg-white/10 hover:bg-primary p-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Services', path: '/services' },
                { label: 'Pricing', path: '/pricing' },
                { label: 'Track Order', path: '/track-order' },
                { label: 'FAQ', path: '/faq' },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-white/70 hover:text-primary transition-colors inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Our Services
            </h3>
            <ul className="space-y-2 text-white/70">
              <li>Same-Day Delivery</li>
              <li>Next-Day Delivery</li>
              <li>International Shipping</li>
              <li>Freight Services</li>
              <li>Express Delivery</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">
                  ቦሌ ሜዳ፣ አዲስ አበባ፣ ኢትዮጵያ
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:+251911234567" className="text-white/70 text-sm hover:text-primary transition-colors">
                  +251 91 123 4567
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:support@hasetdelivery.com" className="text-white/70 text-sm hover:text-primary transition-colors">
                  support@hasetdelivery.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              &copy; {currentYear} ሀሴት Delivery Services. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="#" className="text-white/60 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-white/60 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-white/60 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-primary" />
    </footer>
  );
}