import { MapPin, Edit, Trash2, Star, Home, Briefcase, Building2, MapPinned } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SavedAddress } from '../../services/savedAddressService';
import { format } from 'date-fns';

interface AddressCardProps {
    address: SavedAddress;
    onEdit: (address: SavedAddress) => void;
    onDelete: (id: number) => void;
}

const getLabelIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return <Home className="h-4 w-4" />;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <Briefcase className="h-4 w-4" />;
    return <MapPinned className="h-4 w-4" />;
};

export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {getLabelIcon(address.label)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">{address.label}</h3>
                                    {address.isDefault && (
                                        <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                                            <Star className="h-3 w-3 mr-1 fill-primary" />
                                            Default
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Added {format(new Date(address.createdAt), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 mt-3 text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            <p className="text-sm leading-relaxed">{address.address}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(address)}
                            className="h-9 w-9"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(address.id)}
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

