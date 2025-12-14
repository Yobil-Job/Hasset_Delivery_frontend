import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { paymentService } from '../services/paymentService';
import { toast } from 'sonner';

export function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const verifyPayment = async () => {
            // Chapa redirects with tx_ref parameter (not txRef)
            const txRef = searchParams.get('tx_ref') || searchParams.get('txRef');
            
            if (!txRef) {
                setVerifying(false);
                setPaymentStatus('failed');
                setErrorMessage('Transaction reference not found. Please check your order status.');
                return;
            }

            try {
                // Add a small delay to ensure Chapa has processed the payment
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const response = await paymentService.verifyPayment(txRef);
                
                if (response.success && response.payment) {
                    setPaymentStatus('success');
                    toast.success('Payment verified successfully!');
                } else {
                    setPaymentStatus('failed');
                    setErrorMessage(response.error || 'Payment verification failed. Please check your order status or contact support.');
                    toast.error(response.error || 'Payment verification failed');
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setPaymentStatus('failed');
                const errorMsg = error.response?.data?.error || 
                                error.response?.data?.message || 
                                error.message ||
                                'Failed to verify payment. Please check your order status or contact support.';
                setErrorMessage(errorMsg);
                toast.error('Failed to verify payment');
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-border/50 shadow-lg">
                        <CardContent className="p-8">
                            {verifying ? (
                                <div className="text-center py-12">
                                    <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                                    <h2 className="text-2xl font-bold text-foreground mb-2">
                                        Verifying Payment
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Please wait while we verify your payment...
                                    </p>
                                </div>
                            ) : paymentStatus === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4"
                                    >
                                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-foreground mb-2">
                                        Payment Successful!
                                    </h2>
                                    <p className="text-muted-foreground mb-8">
                                        Your payment has been verified and your order is now being processed.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link to="/orders">
                                            <Button className="bg-primary hover:bg-primary/90">
                                                View My Orders
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link to="/order/create">
                                            <Button variant="outline">
                                                Create New Order
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
                                    >
                                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-foreground mb-2">
                                        Payment Failed
                                    </h2>
                                    <p className="text-muted-foreground mb-4">
                                        {errorMessage || 'Your payment could not be processed. Please try again.'}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button 
                                            onClick={() => navigate(-1)}
                                            variant="outline"
                                        >
                                            Go Back
                                        </Button>
                                        <Link to="/orders">
                                            <Button className="bg-primary hover:bg-primary/90">
                                                View My Orders
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

