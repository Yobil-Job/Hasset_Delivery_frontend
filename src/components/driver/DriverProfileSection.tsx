import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  Edit,
  Save,
  X,
  Star,
  Award,
  Truck,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card3D } from '@/components/global/Card3D';
import { GlassCard } from '@/components/global/GlassCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { driverService } from '@/services/driverService';

interface DriverProfileSectionProps {
  user?: any | null;
  totalDeliveries?: number;
}

export function DriverProfileSection({ user, totalDeliveries = 0 }: DriverProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Driver' : 'Driver',
    email: user?.email || 'driver@example.com',
    phone: user?.phoneNumber || '+251 91 000 0000',
    address: user?.address || '',
    vehicleType: '',
    licenseNumber: '',
    joinDate: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : '—',
    rating: 0,
    totalDeliveries,
    experience: '—',
  });

  const [editedProfile, setEditedProfile] = useState(profile);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);

  // Fetch driver profile data from backend
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        const data = await driverService.getDriverProfile();
        setDriverData(data);
        setProfile((prev) => ({
          ...prev,
          vehicleType: data.vehicleType || '',
          licenseNumber: data.licenseNumber || '',
        }));
        setEditedProfile((prev) => ({
          ...prev,
          vehicleType: data.vehicleType || '',
          licenseNumber: data.licenseNumber || '',
        }));
      } catch (error) {
        console.error('Failed to fetch driver data:', error);
        // Don't show error toast, just use empty values
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  useEffect(() => {
    const loadReviews = () => {
      const driverRatings = JSON.parse(localStorage.getItem('driverRatings') || '{}');
      const driverIdFromData = driverData?.id?.toString() || user?.id?.toString() || '';
      const myRatings = driverIdFromData ? (driverRatings[driverIdFromData] || []) : [];
      setCustomerReviews(myRatings);

      if (myRatings.length > 0) {
        const avgRating =
          myRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / myRatings.length;
        setProfile((prev) => ({
          ...prev,
          rating: Number(avgRating.toFixed(1)),
          totalDeliveries: myRatings.length || totalDeliveries,
        }));
      }
    };

    loadReviews();
    const interval = setInterval(loadReviews, 5000);
    return () => clearInterval(interval);
  }, [driverData, user, totalDeliveries]);

  useEffect(() => {
    // Sync profile basic info when backend user or totals change
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        address: user.address || prev.address,
        joinDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : prev.joinDate,
        totalDeliveries,
      }));
      setEditedProfile((prev) => ({
        ...prev,
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        address: user.address || prev.address,
      }));
    } else {
      setProfile((prev) => ({ ...prev, totalDeliveries }));
    }
  }, [user, totalDeliveries]);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const stats = [
    {
      icon: Package,
      label: 'Total Deliveries',
      value: profile.totalDeliveries.toString(),
      color: 'from-blue-500 to-cyan-500',
    },
    ...(profile.rating > 0
      ? [
          {
            icon: Star,
            label: 'Rating',
            value: profile.rating.toString(),
            color: 'from-yellow-500 to-orange-500',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card3D>
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-3xl">
                    {profile.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-full"
                    onClick={() => toast.info('Upload feature coming soon')}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">{profile.name}</h3>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{profile.name}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, email: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">{profile.email}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, phone: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.address}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, address: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">{profile.address || '—'}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4" />
                    Vehicle Type
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.vehicleType}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, vehicleType: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">{profile.vehicleType || '—'}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    License Number
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.licenseNumber}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, licenseNumber: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">{profile.licenseNumber || '—'}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </Label>
                  <p className="text-foreground">{profile.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </Card3D>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card3D>
              <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white`}>
                <stat.icon className="h-8 w-8 mb-4 opacity-80" />
                <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </Card3D>
          </motion.div>
        ))}
      </div>

      <Card3D>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                Customer Reviews
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {customerReviews.length} {customerReviews.length === 1 ? 'review' : 'reviews'} from
                customers
              </p>
            </div>
            {customerReviews.length > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold">{profile.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            )}
          </div>

          {customerReviews.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {customerReviews
                .slice()
                .reverse()
                .map((review: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-muted/50 rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {review.customerName || 'Customer'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.date
                            ? new Date(review.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Order: {review.orderId}</p>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No customer reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete more deliveries to receive customer feedback
              </p>
            </div>
          )}
        </GlassCard>
      </Card3D>
    </div>
  );
}


