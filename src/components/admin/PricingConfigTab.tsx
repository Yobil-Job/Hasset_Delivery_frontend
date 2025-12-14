import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { DollarSign, Edit } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingConfigTabProps {
    pricingConfig: any;
    isPricingDialogOpen: boolean;
    setIsPricingDialogOpen: (open: boolean) => void;
    pricingForm: any;
    setPricingForm: (form: any) => void;
    handleOpenPricingDialog: () => void;
    handleSavePricingConfig: () => void;
}

export function PricingConfigTab({
    pricingConfig,
    isPricingDialogOpen,
    setIsPricingDialogOpen,
    pricingForm,
    setPricingForm,
    handleOpenPricingDialog,
    handleSavePricingConfig
}: PricingConfigTabProps) {
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
                            <DollarSign className="w-5 h-5 text-primary" />
                            Pricing Configuration
                        </CardTitle>
                        <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleOpenPricingDialog} className="gap-2">
                                    <Edit className="w-4 h-4" />
                                    {pricingConfig ? 'Edit Configuration' : 'Create Configuration'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{pricingConfig ? 'Edit' : 'Create'} Pricing Configuration</DialogTitle>
                                    <DialogDescription>
                                        Configure the base pricing parameters for delivery calculations
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="baseFee">Base Fee (ETB)</Label>
                                        <Input
                                            id="baseFee"
                                            type="number"
                                            step="0.01"
                                            value={pricingForm.baseFee}
                                            onChange={(e) => setPricingForm({ ...pricingForm, baseFee: parseFloat(e.target.value) })}
                                            placeholder="80.00"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="distanceRate">Distance Rate per KM (ETB)</Label>
                                        <Input
                                            id="distanceRate"
                                            type="number"
                                            step="0.01"
                                            value={pricingForm.distanceRatePerKm}
                                            onChange={(e) => setPricingForm({ ...pricingForm, distanceRatePerKm: parseFloat(e.target.value) })}
                                            placeholder="12.00"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="freeWeight">Free Weight Limit (KG)</Label>
                                        <Input
                                            id="freeWeight"
                                            type="number"
                                            step="0.01"
                                            value={pricingForm.freeWeightLimit}
                                            onChange={(e) => setPricingForm({ ...pricingForm, freeWeightLimit: parseFloat(e.target.value) })}
                                            placeholder="10.00"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="weightFee">Additional Weight Fee per KG (ETB)</Label>
                                        <Input
                                            id="weightFee"
                                            type="number"
                                            step="0.01"
                                            value={pricingForm.additionalWeightFeePerKg}
                                            onChange={(e) => setPricingForm({ ...pricingForm, additionalWeightFeePerKg: parseFloat(e.target.value) })}
                                            placeholder="8.00"
                                        />
                                    </div>
                                    <Button onClick={handleSavePricingConfig} className="w-full">
                                        {pricingConfig ? 'Update' : 'Create'} Configuration
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {pricingConfig ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Base Fee</div>
                                <div className="text-2xl font-bold">{pricingConfig.baseFee} ETB</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Distance Rate</div>
                                <div className="text-2xl font-bold">{pricingConfig.distanceRatePerKm} ETB/KM</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Free Weight Limit</div>
                                <div className="text-2xl font-bold">{pricingConfig.freeWeightLimit} KG</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Weight Fee</div>
                                <div className="text-2xl font-bold">{pricingConfig.additionalWeightFeePerKg} ETB/KG</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No pricing configuration found. Click "Create Configuration" to set up pricing.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
