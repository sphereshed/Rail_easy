import React from "react";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface RideRequest {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  fare: number;
  status: string;
  pickup_time: string;
  passenger_name?: string;
}

const RideRequestPopup = () => {
  const [pendingRide, setPendingRide] = useState<RideRequest | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingRide = async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          bookings:booking_id (
            passenger_name
          )
        `)
        .eq('driver_id', user?.id)
        .eq('status', 'pending')
        .single();

      if (error) {
        console.error('Error fetching pending ride:', error);
        return;
      }

      setPendingRide(data);
    };

    fetchPendingRide();

    // Subscribe to changes
    const channel = supabase
      .channel('rides_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'rides',
        filter: `driver_id=eq.${user?.id}`
      }, (payload) => {
        fetchPendingRide();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleAcceptRide = async () => {
    if (!pendingRide) return;

    const { error } = await supabase
      .from('rides')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', pendingRide.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept ride. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Ride accepted successfully!"
    });
  };

  const handleRejectRide = async () => {
    if (!pendingRide) return;

    const { error } = await supabase
      .from('rides')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', pendingRide.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject ride. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Ride rejected successfully"
    });
  };

  if (!pendingRide) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
        <p className="text-center text-gray-500">No pending ride requests</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
      {/* Mini Map Preview */}
      <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
        <span className="text-gray-400">[Mini Map]</span>
      </div>
      {/* Ride Details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="material-icons text-blue-600">place</span>
          <span className="font-medium">Pickup:</span>
          <span className="text-gray-700">{pendingRide.pickup_location}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-icons text-blue-600">flag</span>
          <span className="font-medium">Drop:</span>
          <span className="text-gray-700">{pendingRide.dropoff_location}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-icons text-blue-600">schedule</span>
          <span className="font-medium">Pickup Time:</span>
          <span className="text-gray-700">
            {new Date(pendingRide.pickup_time).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-icons text-blue-600">attach_money</span>
          <span className="font-medium">Fare:</span>
          <span className="text-gray-700">₹{pendingRide.fare}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-icons text-blue-600">person</span>
          <span className="font-medium">Passenger:</span>
          <span className="text-gray-700">{pendingRide.passenger_name}</span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <button 
          onClick={handleAcceptRide}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-lg shadow transition"
        >
          Accept Ride
        </button>
        <button 
          onClick={handleRejectRide}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-lg shadow transition"
        >
          Reject Ride
        </button>
      </div>
    </div>
  );
};

export default RideRequestPopup;
