import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { LocationSearch } from '../global/LocationSearch';
import { SavedAddress, SavedAddressRequest } from '../../services/savedAddressService';

interface AddressFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (address: SavedAddressRequest) => Promise<void>;
    address?: SavedAddress | null;
}

export function AddressForm({ open, onClose, onSave, address }: AddressFormProps) {
    const [formData, setFormData] = useState<SavedAddressRequest>({
        label: '',
        address: '',
        latitude: 0,
        longitude: 0,
        isDefault: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (address) {
            setFormData({
                label: address.label,
                address: address.address,
                latitude: address.latitude,
                longitude: address.longitude,
                isDefault: address.isDefault
            });
        } else {
            setFormData({
                label: '',
                address: '',
                latitude: 0,
                longitude: 0,
                isDefault: false
            });
        }
        setError(null);
    }, [address, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.label.trim()) {
            setError('Label is required');
            return;
        }

        if (!formData.address.trim()) {
            setError('Address is required');
            return;
        }

        if (formData.latitude === 0 || formData.longitude === 0) {
            setError('Please select a valid location');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="label">Label *</Label>
                        <Input
                            id="label"
                            placeholder="e.g., Home, Work, Office"
                            value={formData.label}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <LocationSearch
                            id="address"
                            placeholder="Search and select address..."
                            value={formData.address}
                            onLocationSelect={(address, lat, lng) =>
                                setFormData(prev => ({ ...prev, address, latitude: lat, longitude: lng }))
                            }
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                        />
                        <Label htmlFor="isDefault" className="cursor-pointer">
                            Set as default address
                        </Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : address ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

