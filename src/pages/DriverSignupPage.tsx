import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Package, Phone, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { SEO } from '../components/global/SEO';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { driverService } from '../services/driverService';

export function DriverSignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        vehicleType: '',
        licenseNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!agreeToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        try {
            const nameParts = formData.fullName.split(' ');
            const firstname = nameParts[0];
            const lastname = nameParts.slice(1).join(' ') || '';

            await driverService.registerDriver({
                firstname,
                lastname,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                vehicleType: formData.vehicleType,
                licenseNumber: formData.licenseNumber
            });

            toast.success('Driver registration submitted! Please verify your email.');
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex">
            <SEO
                title="Driver Registration - ሀሴት Delivery"
                description="Join our driver network and start earning with ሀሴት Delivery."
            />

            {/* Left Side - Hero */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-orange-600">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

                <div className="relative h-full flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Car className="h-24 w-24 mx-auto mb-8" />
                            <h2 className="text-4xl mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Become a Driver
                            </h2>
                            <p className="text-xl text-white/90 max-w-md mx-auto mb-12">
                                Join our delivery network and earn on your schedule
                            </p>

                            <div className="space-y-4 max-w-md mx-auto text-left">
                                {[
                                    'Flexible working hours',
                                    'Competitive earnings',
                                    'Weekly payouts',
                                    'Insurance coverage',
                                    'Dedicated support team',
                                ].map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)', x: 5 }}
                                    >
                                        <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                        <span>{benefit}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    <ScrollReveal>
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 mb-8 group">
                            <div className="bg-gradient-to-br from-primary to-orange-600 p-2 rounded-xl">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-2xl text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ሀሴት Delivery
                            </span>
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-4xl text-foreground mb-2">
                                Driver Registration
                            </h1>
                            <p className="text-muted-foreground">
                                Start your journey as a delivery driver
                            </p>
                        </div>

                        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative mt-2">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            required
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative mt-2">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative mt-2">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+251 9..."
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            required
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                                    <div className="relative mt-2">
                                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="vehicleType"
                                            type="text"
                                            placeholder="Motorcycle, Car, Van"
                                            value={formData.vehicleType}
                                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                            required
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="licenseNumber">License Number</Label>
                                    <div className="relative mt-2">
                                        <Input
                                            id="licenseNumber"
                                            type="text"
                                            placeholder="DL123456"
                                            value={formData.licenseNumber}
                                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                            required
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative mt-2">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative mt-2">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={agreeToTerms}
                                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                                        className="mt-1"
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm text-muted-foreground cursor-pointer"
                                    >
                                        I agree to the{' '}
                                        <Link to="#" className="text-primary hover:underline">
                                            Driver Terms
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="#" className="text-primary hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-orange-600 h-12" size="lg">
                                        Register as Driver
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </motion.div>
                            </form>
                        </div>

                        <p className="text-center mt-8 text-muted-foreground">
                            Already registered?{' '}
                            <Link to="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
