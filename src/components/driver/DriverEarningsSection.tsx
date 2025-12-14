import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  Package,
  Clock,
  Star,
  X,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle,
} from 'lucide-react';
import { Card3D } from '@/components/global/Card3D';
import { GlassCard } from '@/components/global/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

interface DriverEarningsSectionProps {
  todayEarnings: number;
  weekEarnings: number;
  totalDeliveries: number;
  orders: any[];
}

export function DriverEarningsSection({
  todayEarnings,
  weekEarnings,
  totalDeliveries,
  orders,
}: DriverEarningsSectionProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const delivered = useMemo(
    () => (orders || []).filter((o) => o.status === 'DELIVERED'),
    [orders],
  );

  const totalEarnings = useMemo(
    () =>
      delivered.reduce(
        (sum: number, o: any) => sum + (typeof o.price === 'number' ? o.price : 0),
        0,
      ),
    [delivered],
  );

  // Build daily data for the last 7 days from real orders
  const earningsData = useMemo(() => {
    const today = new Date();
    const last7: { date: string; earnings: number; deliveries: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

      const forDay = delivered.filter((o: any) => o.createdAt && o.createdAt.startsWith(key));
      const earnings = forDay.reduce(
        (sum: number, o: any) => sum + (typeof o.price === 'number' ? o.price : 0),
        0,
      );

      last7.push({
        date: d.toLocaleDateString(undefined, { weekday: 'short' }),
        earnings,
        deliveries: forDay.length,
      });
    }

    return last7;
  }, [delivered]);

  // Build monthly earnings for last up to 6 months
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();

    delivered.forEach((o: any) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`; // year-month
      const label = d.toLocaleDateString(undefined, { month: 'short' });
      const amount = typeof o.price === 'number' ? o.price : 0;
      map.set(key, (map.get(key) || 0) + amount);
      // store label via property on map key (not needed; we can recompute)
    });

    const entries = Array.from(map.entries())
      .map(([key, earnings]) => {
        const [year, month] = key.split('-').map(Number);
        const d = new Date(year, month, 1);
        return { key, monthLabel: d.toLocaleDateString(undefined, { month: 'short' }), earnings };
      })
      .sort((a, b) => (a.key < b.key ? -1 : 1))
      .slice(-6);

    return entries.map((e) => ({ month: e.monthLabel, earnings: e.earnings }));
  }, [delivered]);

  // Payment history: one entry per month from real earnings
  const [transactions, setTransactions] = useState(() => {
    const now = new Date();
    return monthlyData.map((m, idx) => ({
      id: `PAY-${now.getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
      date: now.toLocaleDateString(),
      amount: `${m.earnings.toFixed(2)} ETB`,
      deliveries: delivered.length, // approx
      status: idx === monthlyData.length - 1 ? 'Pending' : 'Paid',
      period: m.month,
    }));
  });

  const stats = [
    {
      label: "Today's Earnings",
      value: `${todayEarnings.toFixed(2)} ETB`,
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'This Week',
      value: `${weekEarnings.toFixed(2)} ETB`,
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Earnings',
      value: `${totalEarnings.toFixed(2)} ETB`,
      change: 'All time',
      trend: 'up',
      icon: DollarSign,
      color: 'from-primary to-orange-600',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500';
      case 'Pending':
        return 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:text-white dark:border-amber-500';
      case 'Processing':
        return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-500';
      default:
        return 'bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:text-white dark:border-slate-500';
    }
  };

  const handleRequestPayout = () => {
    // Inform user that payouts are handled by admin
    toast.info('Payouts are processed by the admin. Please contact support for payment requests.', {
      duration: 5000,
    });
    setShowPayoutModal(false);
    setPayoutMethod('');
    setAccountNumber('');
    setAccountName('');
    setPhoneNumber('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Earnings</h1>
          <p className="text-muted-foreground">Track your earnings and payment history</p>
        </div>
        <Button
          onClick={() => setShowPayoutModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          disabled={!transactions.some((t) => t.status === 'Pending')}
        >
          <Wallet className="h-4 w-4 mr-2" />
          Request Payout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card3D>
              <div className="bg-card border border-border rounded-xl p-6">
                <div
                  className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
            </Card3D>
          </motion.div>
        ))}
      </div>

      <Card3D>
        <GlassCard className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Daily Earnings (Last 7 Days)
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your daily earnings and delivery count
            </p>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="earnings" fill="#FF6600" radius={[8, 8, 0, 0]} name="Earnings (ETB)" />
                <Bar dataKey="deliveries" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Deliveries" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </Card3D>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card3D>
          <GlassCard className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Monthly Earnings Trend
              </h2>
              <p className="text-sm text-muted-foreground">Your earnings over the last 6 months</p>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#FF6600"
                    strokeWidth={3}
                    dot={{ fill: '#FF6600', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Earnings (ETB)"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </Card3D>

        <Card3D>
          <GlassCard className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Performance Summary</h2>
              <p className="text-sm text-muted-foreground">Key metrics for this month</p>
            </div>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Total Deliveries</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{totalDeliveries}</span>
                </div>
                <div className="bg-background rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: '85%' }}
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Avg Delivery Time</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">22 min</span>
                </div>
                <p className="text-xs text-green-600 font-medium">-3 min from last month</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-muted-foreground">Average Rating</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">4.9</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Avg Earnings/Day</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">822 ETB</span>
                </div>
                <p className="text-xs text-green-600 font-medium">+12% from last month</p>
              </div>
            </div>
          </GlassCard>
        </Card3D>
      </div>

      <Card3D>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Payment History</h2>
              <p className="text-sm text-muted-foreground">Your monthly payment records</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-4 mb-3 md:mb-0">
                  <div
                    className={`bg-gradient-to-br ${
                      transaction.status === 'Paid'
                        ? 'from-green-500 to-emerald-500'
                        : 'from-yellow-500 to-orange-500'
                    } w-12 h-12 rounded-lg flex items-center justify-center`}
                  >
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{transaction.id}</p>
                    <p className="text-sm text-muted-foreground">{transaction.period}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.deliveries} deliveries completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{transaction.amount}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="min-w-[100px]">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        transaction.status,
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </Card3D>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card3D>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Total Earnings</h3>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{totalEarnings.toFixed(2)} ETB</p>
            <p className="text-sm text-muted-foreground">From {delivered.length} completed deliveries</p>
            <div className="mt-4 bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                style={{ width: delivered.length > 0 ? '100%' : '0%' }}
              />
            </div>
          </div>
        </Card3D>

        <Card3D>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">This Week</h3>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{weekEarnings.toFixed(2)} ETB</p>
            <p className="text-sm text-muted-foreground">Last 7 days earnings</p>
            <div className="mt-4 bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                style={{ width: totalEarnings > 0 ? `${(weekEarnings / totalEarnings) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </Card3D>

        <Card3D>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Today</h3>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{todayEarnings.toFixed(2)} ETB</p>
            <p className="text-sm text-muted-foreground">Today's earnings</p>
            <div className="mt-4 bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                style={{ width: '6%' }}
              />
            </div>
          </div>
        </Card3D>
      </div>

      {/* Payout Request Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Payment Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Payouts are processed by admin. Contact support for payment requests.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPayoutModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-90">Available for Payout</p>
                  <p className="text-3xl font-bold mt-1">24,680 ETB</p>
                  <p className="text-xs opacity-75 mt-2">
                    From Nov 1 - Nov 30, 2024 (148 deliveries)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout-method">Payout Method</Label>
                  <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                    <SelectTrigger id="payout-method">
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                      <SelectItem value="telebirr">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          TeleBirr
                        </div>
                      </SelectItem>
                      <SelectItem value="cbebirr">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          CBE Birr
                        </div>
                      </SelectItem>
                      <SelectItem value="mpesa">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          M-PESA
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {payoutMethod === 'bank' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Account Holder Name</Label>
                      <Input
                        id="account-name"
                        type="text"
                        placeholder="Enter account holder name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input
                        id="account-number"
                        type="text"
                        placeholder="Enter account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {(payoutMethod === 'telebirr' || payoutMethod === 'mpesa') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="+251-XXX-XXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </motion.div>
                )}

                {payoutMethod === 'cbebirr' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="cbe-account">CBE Birr Account Number</Label>
                    <Input
                      id="cbe-account"
                      type="tel"
                      placeholder="10000XXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Account number should start with 10000
                    </p>
                  </motion.div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    ℹ️ Payout requests are processed within 2-3 business days. You will receive a
                    confirmation once the payment is completed.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestPayout}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    disabled={!payoutMethod}
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Request Submitted Successfully!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your payout request has been received and is being processed.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  📋 <span className="font-semibold">Processing Timeline:</span>
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Payout requests are processed within{' '}
                  <span className="font-semibold">2-3 business days</span>. You will receive a
                  confirmation once the payment is completed.
                </p>
              </div>

              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Got it!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


