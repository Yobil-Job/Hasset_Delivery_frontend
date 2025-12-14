import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { AddressCard } from '../components/address/AddressCard';
import { AddressForm } from '../components/address/AddressForm';
import { savedAddressService, SavedAddress, SavedAddressRequest } from '../services/savedAddressService';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';

export function AddressBookPage() {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await savedAddressService.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Failed to fetch addresses', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: SavedAddressRequest) => {
        if (editingAddress) {
            await savedAddressService.updateAddress(editingAddress.id, data);
            toast.success('Address updated successfully');
        } else {
            await savedAddressService.createAddress(data);
            toast.success('Address added successfully');
        }
        await fetchAddresses();
        setEditingAddress(null);
    };

    const handleEdit = (address: SavedAddress) => {
        setEditingAddress(address);
        setFormOpen(true);
    };

    const handleDelete = (id: number) => {
        setAddressToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (addressToDelete === null) return;
        try {
            await savedAddressService.deleteAddress(addressToDelete);
            toast.success('Address deleted successfully');
            await fetchAddresses();
        } catch (error: any) {
            console.error('Failed to delete address', error);
            toast.error(error.response?.data?.error || 'Failed to delete address');
        } finally {
            setDeleteDialogOpen(false);
            setAddressToDelete(null);
        }
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setFormOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                                    Address Book
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Manage your saved addresses for quick access
                                </p>
                            </div>
                            <Button onClick={handleAddNew} className="bg-gradient-to-r from-primary to-orange-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Address
                            </Button>
                        </div>

                        {/* Addresses List */}
                        {addresses.length === 0 ? (
                            <Card className="border-border/50">
                                <CardContent className="p-12 text-center">
                                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MapPin className="h-10 w-10 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">No saved addresses</h2>
                                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                        Add your frequently used addresses to make ordering faster and easier.
                                    </p>
                                    <Button onClick={handleAddNew} className="bg-gradient-to-r from-primary to-orange-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Address
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {addresses.map((address, index) => (
                                    <motion.div
                                        key={address.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <AddressCard
                                            address={address}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Address Form Dialog */}
            <AddressForm
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingAddress(null);
                }}
                onSave={handleSave}
                address={editingAddress}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

