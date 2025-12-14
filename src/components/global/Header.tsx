import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from './ThemeToggle';
import { motion, useScroll } from 'motion/react';
import logoImage from 'figma:asset/027612d655664ce5469a768edc12392eca0af979.png';
import { authService } from '../../services/auth';
import { toast } from 'sonner';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  // Check auth state on mount and route change
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
      // Force logout on client side even if server fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Book Now', path: '/order/create' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-card/80 backdrop-blur-lg border-b border-border shadow-lg'
          : 'bg-transparent border-b border-transparent'
        }
      `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
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
              className="relative"
            >
              <img
                src={logoImage}
                alt="ሀሴት Delivery"
                className="h-14 w-14 object-contain"
              />
            </motion.div>
            <span className="text-2xl text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ሀሴት Delivery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
              >
                <motion.div
                  className={`px-4 py-2 rounded-lg transition-all relative ${isActive(item.path)
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-primary'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                  {isActive(item.path) && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 shadow-lg shadow-primary/25">
                      Sign Up
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-primary/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <motion.div
                    className={`px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                      }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.div>
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="h-5 w-5 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-primary to-orange-600">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}