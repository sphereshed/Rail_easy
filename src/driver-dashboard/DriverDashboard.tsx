import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { MapPin, DollarSign, Star, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DriverProfileEditor from './DriverProfileEditor';
import RideRequestPopup from './RideRequestPopup';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <Card className="bg-white border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className="text-gray-400">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DriverDashboard = () => {
  const { user, isEmailVerified, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [rideRequests, setRideRequests] = useState<any[]>([]);
  const [currentRideRequest, setCurrentRideRequest] = useState<any>(null);
  const [showRidePopup, setShowRidePopup] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isDriver = user?.user_metadata?.role === 'driver';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!isDriver) {
      navigate('/');
    } else {
      loadProfile();
      subscribeToRideRequests();
    }
  }, [user, isDriver, navigate]);

  useEffect(() => {
    if (isAvailable) {
      fetchPendingRideRequests();
      // Poll for new ride requests every 3 seconds when available
      const interval = setInterval(fetchPendingRideRequests, 3000);
      return () => clearInterval(interval);
    }
  }, [isAvailable]);

  const loadProfile = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
        setIsAvailable(data.is_available || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRideRequests = () => {
    if (!user?.id) return;

    // Subscribe to ride requests
    const subscription = supabase
      .channel('ride_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_requests',
          filter: `status=eq.pending`,
        },
        (payload) => {
          if (isAvailable) {
            setRideRequests(prev => [payload.new, ...prev]);
            showNewRideNotification(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchPendingRideRequests = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      if (data) {
        setRideRequests(data);
      }
    } catch (error) {
      console.error('Error fetching ride requests:', error);
    }
  };

  const showNewRideNotification = (request: any) => {
    toast({
      title: "New Ride Request! 🚗",
      description: `${request.pickup_location} → ${request.dropoff_location}`,
    });
  };

  const toggleAvailability = async () => {
    if (!user?.id || !profile) return;
    
    setUpdatingStatus(true);
    try {
      const newStatus = !isAvailable;
      const { error } = await supabase
        .from('drivers')
        .update({ is_available: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      setIsAvailable(newStatus);
      setProfile({ ...profile, is_available: newStatus });

      toast({
        title: newStatus ? "You're Now Available" : "You're Now Unavailable",
        description: newStatus 
          ? "You will receive ride requests" 
          : "You will not receive ride requests",
      });

      if (!newStatus) {
        setRideRequests([]);
        setShowRidePopup(false);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAcceptRide = async (rideRequest: any) => {
    if (!user?.id) return;

    try {
      // Create a ride offer
      const { error: offerError } = await supabase
        .from('ride_offers')
        .insert({
          ride_request_id: rideRequest.id,
          driver_id: user.id,
          status: 'accepted',
          estimated_arrival_time: 300, // 5 minutes
          vehicle_details: `${profile?.vehicle_type} - ${profile?.vehicle_number}`
        });

      if (offerError) throw offerError;

      // Create active ride
      const { error: rideError } = await supabase
        .from('active_rides')
        .insert({
          ride_request_id: rideRequest.id,
          driver_id: user.id,
          passenger_id: rideRequest.passenger_id,
          pickup_location: rideRequest.pickup_location,
          dropoff_location: rideRequest.dropoff_location,
          status: 'accepted',
          started_at: new Date().toISOString()
        });

      if (rideError) throw rideError;

      // Update ride request status
      await supabase
        .from('ride_requests')
        .update({ status: 'accepted' })
        .eq('id', rideRequest.id);

      toast({
        title: "Ride Accepted! ✅",
        description: "You've successfully accepted the ride",
      });

      setShowRidePopup(false);
      setCurrentRideRequest(null);
      setRideRequests(prev => prev.filter(r => r.id !== rideRequest.id));
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast({
        title: "Error",
        description: "Failed to accept ride",
        variant: "destructive"
      });
    }
  };

  const handleRejectRide = async (rideRequest: any) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('ride_offers')
        .insert({
          ride_request_id: rideRequest.id,
          driver_id: user.id,
          status: 'rejected'
        });

      if (error) throw error;

      toast({
        title: "Ride Rejected",
        description: "You've rejected this ride request",
      });

      setRideRequests(prev => prev.filter(r => r.id !== rideRequest.id));
      setShowRidePopup(false);
      setCurrentRideRequest(null);
    } catch (error) {
      console.error('Error rejecting ride:', error);
      toast({
        title: "Error",
        description: "Failed to reject ride",
        variant: "destructive"
      });
    }
  };

  if (!user || !isDriver) {
    return null;
  }

  if (!isEmailVerified()) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            Please verify your email address to access the driver dashboard. Check your inbox for the verification link.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your rides and profile</p>
        </div>
        <Button 
          variant="outline" 
          onClick={signOut}
          className="text-red-700 border-red-200 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {editMode ? (
          <Card className="bg-white shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <button
                  onClick={() => {
                    setEditMode(false);
                    loadProfile();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <DriverProfileEditor onSuccess={() => {
                setEditMode(false);
                loadProfile();
              }} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                icon={<MapPin className="w-6 h-6" />}
                label="Total Rides"
                value="0"
              />
              <StatCard 
                icon={<DollarSign className="w-6 h-6" />}
                label="Total Earnings"
                value="₹0"
              />
              <StatCard 
                icon={<Star className="w-6 h-6" />}
                label="Rating"
                value="5 ⭐"
              />
              <StatCard 
                icon={<Clock className="w-6 h-6" />}
                label="Status"
                value={isAvailable ? 'Available' : 'Unavailable'}
              />
            </div>

            {/* Availability Toggle */}
            <Card className="bg-white shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isAvailable 
                        ? "You're currently available to receive ride requests" 
                        : "You're currently not available. Toggle to start receiving requests"}
                    </p>
                  </div>
                  <Button
                    onClick={toggleAvailability}
                    disabled={updatingStatus}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                      isAvailable
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {updatingStatus ? 'Updating...' : (isAvailable ? 'Available' : 'Unavailable')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ride Requests Display */}
            {isAvailable && rideRequests.length > 0 && (
              <Card className="bg-white shadow-lg mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Available Ride Requests ({rideRequests.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {rideRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setCurrentRideRequest(request);
                          setShowRidePopup(true);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">📍 {request.pickup_location}</p>
                            <p className="text-sm text-gray-600 mt-1">→ {request.dropoff_location}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Passengers: {request.passenger_count} | {request.vehicle_preference || 'Any'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentRideRequest(request);
                              setShowRidePopup(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Driver Profile Section */}
            <Card className="bg-white shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Driver Profile</h2>
                    <p className="text-gray-600 text-sm mt-1">Manage your vehicle and license information</p>
                  </div>
                  <Button 
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Edit Profile
                  </Button>
                </div>

                {!loading && profile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Vehicle Type</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {profile?.vehicle_type || 'Not set'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Vehicle Number</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {profile?.vehicle_number || 'Not set'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">License Number</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {profile?.license_number || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Loading profile...</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Rides Section */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Rides</h2>
                <p className="text-gray-600">Your ride history and upcoming bookings</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Ride Request Popup */}
      {showRidePopup && currentRideRequest && (
        <RideRequestPopup
          rideRequest={currentRideRequest}
          onAccept={() => handleAcceptRide(currentRideRequest)}
          onReject={() => handleRejectRide(currentRideRequest)}
          onClose={() => {
            setShowRidePopup(false);
            setCurrentRideRequest(null);
          }}
        />
      )}
    </div>
  );
};