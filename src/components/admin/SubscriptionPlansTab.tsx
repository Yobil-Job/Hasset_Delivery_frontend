import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { CreditCard, Plus, Edit, Trash2, Package, Truck, Zap, MapPin, Clock, Shield, Rocket, Star, Heart, Gift } from 'lucide-react';
import { motion } from 'motion/react';

const iconMap: { [key: string]: any } = {
    Package,
    Truck,
    Zap,
    MapPin,
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

    // Fallback parsing logic for custom gradients
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

interface SubscriptionPlansTabProps {
    subscriptionPlans: any[];
    isPlanDialogOpen: boolean;
    setIsPlanDialogOpen: (open: boolean) => void;
    editingPlan: any;
    planForm: any;
    setPlanForm: (form: any) => void;
    handleOpenPlanDialog: (plan?: any) => void;
    handleSavePlan: () => void;
    handleDeletePlan: (id: number) => void;
    iconOptions: Array<{ label: string; value: string }>;
    gradientOptions: Array<{ label: string; value: string; preview: string }>;
}

export function SubscriptionPlansTab({
    subscriptionPlans,
    isPlanDialogOpen,
    setIsPlanDialogOpen,
    editingPlan,
    planForm,
    setPlanForm,
    handleOpenPlanDialog,
    handleSavePlan,
    handleDeletePlan,
    iconOptions,
    gradientOptions
}: SubscriptionPlansTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-border shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Subscription Plans
                        </CardTitle>
                        <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => handleOpenPlanDialog()} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingPlan ? 'Edit' : 'Create'} Subscription Plan</DialogTitle>
                                    <DialogDescription>
                                        Configure a subscription plan for customers
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Plan Name</Label>
                                            <Input
                                                id="name"
                                                value={planForm.name}
                                                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                                placeholder="Enterprise Pro"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="price">Price (Display)</Label>
                                            <Input
                                                id="price"
                                                value={planForm.price}
                                                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                                                placeholder="5,999 ETB"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Amount (Numeric)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                value={planForm.amount}
                                                onChange={(e) => setPlanForm({ ...planForm, amount: parseFloat(e.target.value) })}
                                                placeholder="5999"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="period">Period</Label>
                                            <Select value={planForm.period} onValueChange={(value) => setPlanForm({ ...planForm, period: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select period" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="per month">Per Month</SelectItem>
                                                    <SelectItem value="per year">Per Year</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={planForm.description}
                                            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                                            placeholder="Ultimate growth suite for scaling businesses"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="features">Features (comma-separated)</Label>
                                        <Textarea
                                            id="features"
                                            value={planForm.features}
                                            onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                                            placeholder="⭐ 25% exclusive discount, 🚀 Dedicated account manager, 📊 Advanced analytics"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="badge">Badge (Optional)</Label>
                                            <Input
                                                id="badge"
                                                value={planForm.badge}
                                                onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                                                placeholder="Most Popular"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-8">
                                            <Checkbox
                                                id="popular"
                                                checked={planForm.popular}
                                                onCheckedChange={(checked) => setPlanForm({ ...planForm, popular: checked as boolean })}
                                            />
                                            <Label htmlFor="popular" className="cursor-pointer">Mark as Popular</Label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="gradient">Color Theme</Label>
                                            <Select value={planForm.gradient} onValueChange={(value) => setPlanForm({ ...planForm, gradient: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a color theme" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {gradientOptions.map((option, idx) => (
                                                        <SelectItem key={idx} value={option.value}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-16 h-4 rounded bg-gradient-to-r ${option.preview}`} />
                                                                <span>{option.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="icon">Icon</Label>
                                            <Select value={planForm.icon} onValueChange={(value) => setPlanForm({ ...planForm, icon: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an icon" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {iconOptions.map((option, idx) => (
                                                        <SelectItem key={idx} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button onClick={handleSavePlan} className="w-full">
                                        {editingPlan ? 'Update' : 'Create'} Plan
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {subscriptionPlans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subscriptionPlans.map((plan) => {
                                const Icon = iconMap[plan.icon] || Package;
                                return (
                                    <Card key={plan.id} className="overflow-hidden">
                                        <div className="relative h-40" style={{ background: convertGradientToCSS(plan.gradient) }}>
                                            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            {plan.badge && (
                                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full max-w-[140px] text-right">
                                                    <span className="text-white text-[11px] font-medium leading-snug line-clamp-2">{plan.badge}</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="px-4 pb-4 pt-8">
                                            <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                                            <div className="text-2xl font-bold mb-3">
                                                {plan.price} <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                                            </div>
                                            <div className="space-y-1 mb-4">
                                                {plan.features.slice(0, 3).map((feature: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                                        <div
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{ background: convertGradientToCSS(plan.gradient) }}
                                                        />
                                                        <span className="text-muted-foreground">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenPlanDialog(plan)}>
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10" onClick={() => handleDeletePlan(plan.id)}>
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No subscription plans found. Click "Add Plan" to create one.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
