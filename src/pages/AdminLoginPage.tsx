import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { SEO } from '../components/global/SEO';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { authService } from '../services/auth';

export function AdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await authService.login({ email, password });

            // Only allow ADMIN to login here
            if (response.role !== 'ADMIN') {
                toast.error('This portal is for administrators only.');
                localStorage.clear();
                return;
            }

            toast.success('Admin login successful!');
            navigate('/admin/dashboard', { replace: true });
        } catch (error: any) {
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <SEO
                title="Admin Portal - ሀሴት Delivery"
                description="Administrator access portal"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative w-full max-w-md p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="bg-gradient-to-br from-red-600 to-orange-600 p-3 rounded-xl">
                            <Shield className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Administrator Portal
                        </h1>
                        <p className="text-slate-400">
                            Restricted Access
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@hasset.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 h-12 bg-slate-900/50 border-slate-700 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 h-12 bg-slate-900/50 border-slate-700 text-white"
                                    />
                                </div>
                            </div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-orange-600 h-12" size="lg">
                                    Access Admin Panel
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        </form>
                    </div>

                    <p className="text-center mt-6 text-slate-500 text-sm">
                        Unauthorized access is prohibited and monitored
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
