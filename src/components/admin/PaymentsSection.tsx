import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Search, Filter, Download, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { paymentService, PaymentResponse } from '../../services/paymentService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function PaymentsSection() {
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(20);

    useEffect(() => {
        fetchPayments();
    }, [currentPage, statusFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                size: pageSize,
                sortBy: 'createdAt',
                sortDir: 'DESC',
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            if (searchTerm) {
                params.txRef = searchTerm;
            }

            const response = await paymentService.getAllPayments(params);
            setPayments(response.payments);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error: any) {
            console.error('Failed to fetch payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(0);
        fetchPayments();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return (
                    <Badge className="bg-green-500 text-white border-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Success
                    </Badge>
                );
            case 'PENDING':
                return (
                    <Badge className="bg-yellow-500 text-white border-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'FAILED':
                return (
                    <Badge className="bg-red-500 text-white border-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            case 'CANCELLED':
                return (
                    <Badge className="bg-gray-500 text-white border-gray-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                        Payment Management
                    </h2>
                    <p className="text-muted-foreground">View and manage all payment transactions</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Transaction Reference..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(0);
                                }}
                                className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
                            >
                                <option value="all">All Status</option>
                                <option value="SUCCESS">Success</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <Button onClick={handleSearch} variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Transactions ({totalItems})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No payments found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction Ref</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Chapa Ref</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment, index) => (
                                            <motion.tr
                                                key={payment.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-border hover:bg-muted/50"
                                            >
                                                <td className="p-4">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {payment.txRef}
                                                    </code>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-medium">#{payment.orderId}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-primary">
                                                        {typeof payment.amount === 'number' 
                                                            ? payment.amount.toFixed(2) 
                                                            : parseFloat(payment.amount).toFixed(2)} {payment.currency}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(payment.status)}
                                                </td>
                                                <td className="p-4">
                                                    {payment.chapaReference ? (
                                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                                            {payment.chapaReference}
                                                        </code>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                    <div className="text-sm text-muted-foreground">
                                        Page {currentPage + 1} of {totalPages} ({totalItems} total)
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                            disabled={currentPage === 0}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

